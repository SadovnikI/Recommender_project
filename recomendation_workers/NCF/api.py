import pandas as pd
from fastapi import Request, FastAPI
from pydantic.typing import List
from serializers import MovieUpdate, UserUpdate
from model import model
from fastapi.middleware.cors import CORSMiddleware
import data
from recommenders.models.ncf.dataset import Dataset as NCFDataset

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


@app.get("/model/train")
def train_model():
    global trained
    try:
        model.fit(data.data)
        trained = True
        return {"status": "success"}
    except tf.train.NanLossDuringTrainingError:
        import warnings
        warnings.warn(
            "Training stopped with NanLossDuringTrainingError. "
            "Try other optimizers, smaller batch size and/or smaller learning rate."
        )
        return {"status": "failed"}


trained = False

@app.get("/model/predict/{user_id}")
def predict_recommendation(user_id):
    user_id = int(user_id)
    global trained
    if not trained:
        model.fit(data.data)
        trained = True
    users, items, preds = [], [], []
    item = list(data.train.itemID.unique())
    for user in data.train.userID.unique():
        user = [user] * len(item)
        users.extend(user)
        items.extend(item)
        preds.extend(list(model.predict(user, item, is_list=True)))

    all_predictions = pd.DataFrame(
        data={"userID": users, "itemID": items, "prediction": preds})

    merged = pd.merge(data.train, all_predictions, on=["userID", "itemID"], how="outer")
    all_predictions = merged[merged.rating.isnull()].drop('rating', axis=1)

    if user_id <0:
        max_sum = 0
        max_user_id = 1

        for u_id in all_predictions["userID"].unique():
            new_sum = all_predictions.loc[all_predictions['userID'] == u_id].sort_values(by=['prediction']).tail(10)['prediction'].sum()
            if new_sum > max_sum:
                max_sum = new_sum
                max_user_id = u_id
        user_id = int(max_user_id)


    return {
        'movie_ids': all_predictions.loc[all_predictions['userID'] == user_id].sort_values(by=['prediction']).tail(10)['itemID'].tolist(),
        'user_id': user_id,
        'positive_prediction': all_predictions.loc[all_predictions['userID'] == user_id].sort_values(by=['prediction']).tail(10)['prediction'].tolist(),
        'negative_prediction': all_predictions.loc[all_predictions['userID'] == user_id].sort_values(by=['prediction']).head(10)['prediction'].tolist(),
    }


@app.get("/model/test/data/{user_id}")
def test_user_data(user_id):
    return data.test.loc[data.test['userID'] == int(user_id)].sort_values(by=['rating']).loc[:, ['itemID', 'rating','userID']].to_dict('records')


@app.get("/model/all/data/{user_id}")
def all_user_data(user_id):
    return data.df.loc[data.df['userID'] == int(user_id)].sort_values(by=['rating'])[['itemID', 'rating']].to_dict('records')


@app.post("/model/update_ratings")
def update_ratings_data(result: List[MovieUpdate]):
    global trained
    if result:
        for row in result:
            row = row.dict()
            timestamp = data.df.loc[data.data['itemID'] == row['itemID']]['timestamp'].values[:1][0]
            row['timestamp'] = timestamp
            data.train = data.train.append(row, ignore_index=True)
            data.df = data.df.append(row, ignore_index=True)
        data.data = NCFDataset(train_file=data.train_file, test_file=data.leave_one_out_test_file,
                          seed=data.SEED, overwrite_test_file_full=True)
        trained = False
        return {"status": "success"}
    return {"status": "failed"}

@app.post("/model/update_users")
def update_user_data(result: UserUpdate):
    return {"status": "success"}


@app.get("/model/all/user/count")
def user_count():
    return {'user_count': data.df['userID'].nunique()}
