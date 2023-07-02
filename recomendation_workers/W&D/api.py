from fastapi import Request, FastAPI
from pydantic.typing import List
from serializers import MovieUpdate, UserUpdate
from model import model
from recommenders.utils import tf_utils
from recommenders.utils.constants import DEFAULT_PREDICTION_COL as PREDICT_COL
from fastapi.middleware.cors import CORSMiddleware
import data
from recommenders.datasets.pandas_df_utils import user_item_pairs
from recommenders.utils.constants import (
    DEFAULT_USER_COL as USER_COL,
    DEFAULT_ITEM_COL as ITEM_COL,
)

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


trained = False

@app.get("/model/train")
def train_model():
    global trained
    try:
        model.train(
            input_fn=data.train_fn,
            steps=50000
        )
        trained = True
        return {"status": "success"}
    except tf.train.NanLossDuringTrainingError:
        import warnings
        warnings.warn(
            "Training stopped with NanLossDuringTrainingError. "
            "Try other optimizers, smaller batch size and/or smaller learning rate."
        )
        return {"status": "failed"}



@app.get("/model/predict/{user_id}")
def predict_recommendation(user_id):
    global trained
    if not trained:
        model.train(
            input_fn=data.train_fn,
            steps=50000
        )
        trained = True

    ranking_pool = user_item_pairs(
        user_df=data.users,
        item_df=data.items,
        user_col=USER_COL,
        item_col=ITEM_COL,
        user_item_filter_df=data.train,
        shuffle=True,
    )
    user_id = int(user_id)
    predictions = list(
        model.predict(input_fn=tf_utils.pandas_input_fn(df=ranking_pool)))
    prediction_df = ranking_pool.copy()
    prediction_df[PREDICT_COL] = [p['predictions'][0] for p in predictions]
    if user_id < 0:
        max_sum = 0
        max_user_id = 1

        for u_id in prediction_df["userID"].unique():
            new_sum = prediction_df.loc[prediction_df['userID'] == u_id].sort_values(by=['prediction']).tail(10)['prediction'].sum()
            if new_sum > max_sum:
                max_sum = new_sum
                max_user_id = u_id
        user_id = int(max_user_id)
    return {
        'movie_ids': prediction_df.loc[prediction_df['userID'] == user_id].sort_values(by=['prediction']).tail(10)['itemID'].tolist(),
        'user_id': user_id,
        'positive_prediction': prediction_df.loc[prediction_df['userID'] == user_id].sort_values(by=['prediction']).tail(10)['prediction'].tolist(),
        'negative_prediction': prediction_df.loc[prediction_df['userID'] == user_id].sort_values(by=['prediction']).head(10)['prediction'].tolist(),
    }


@app.get("/model/test/data/{user_id}")
def test_user_data(user_id):
    return data.test.loc[data.test['userID'] == int(user_id)].sort_values(by=['rating']).loc[:, ['itemID', 'rating','userID']].to_dict('records')


@app.get("/model/all/data/{user_id}")
def all_user_data(user_id):
    print('a', data.data.loc[data.data['userID'] == int(user_id)].sort_values(by=['rating']))
    return data.data.loc[data.data['userID'] == int(user_id)].sort_values(by=['rating'])[['itemID', 'rating']].to_dict('records')


@app.post("/model/update_ratings")
def update_ratings_data(result: List[MovieUpdate]):
    global trained
    if result:
        for row in result:
            row = row.dict()
            genres = data.data.loc[data.data['itemID'] == row['itemID']]['genre'].values[:1][0]
            row['genre'] = genres
            data.train = data.train.append(row, ignore_index=True)
            data.data = data.data.append(row, ignore_index=True)
        trained = False
        return {"status": "success"}
    return {"status": "failed"}

@app.post("/model/update_users")
def update_user_data(result: UserUpdate):
    if result:
        data.users = data.users.append({'userID': int(result.dict()['userID'])}, ignore_index=True)
        return {"status": "success"}
    return {"status": "failed"}


@app.get("/model/all/user/count")
def user_count():
    return {'user_count': data.data['userID'].nunique()}
