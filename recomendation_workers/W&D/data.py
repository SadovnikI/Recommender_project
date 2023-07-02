import warnings
warnings.filterwarnings("ignore")

import os
import sklearn.preprocessing
import tensorflow as tf
tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.INFO)

from recommenders.utils.constants import (
    DEFAULT_USER_COL as USER_COL,
    DEFAULT_ITEM_COL as ITEM_COL,
    DEFAULT_RATING_COL as RATING_COL,
    DEFAULT_PREDICTION_COL as PREDICT_COL,
    DEFAULT_GENRE_COL as ITEM_FEAT_COL,
    SEED
)
from recommenders.utils import tf_utils, gpu_utils, plot
from recommenders.datasets import movielens
from recommenders.datasets.python_splitters import python_random_split
import recommenders.evaluation.python_evaluation as evaluator

# ////////////////////////////////////////////////////////   Parameters

# Recommend top k items
TOP_K = 10
# Select MovieLens data size: 100k, 1m, 10m, or 20m
MOVIELENS_DATA_SIZE = "100k"
# Metrics to use for evaluation
RANKING_METRICS = [
    evaluator.ndcg_at_k.__name__,
    evaluator.precision_at_k.__name__,
]
RATING_METRICS = [
    evaluator.rmse.__name__,
    evaluator.mae.__name__,
]
# Use session hook to evaluate model while training
EVALUATE_WHILE_TRAINING = True

RANDOM_SEED = SEED  # Set seed for deterministic result

# Train and test set pickle file paths. If provided, use them. Otherwise, download the MovieLens dataset.
DATA_DIR = None
TRAIN_PICKLE_PATH = None
TEST_PICKLE_PATH = None
EXPORT_DIR_BASE = os.path.join("outputs", "model")
# Model checkpoints directory. If None, use temp-dir.
MODEL_DIR = None

#### Hyperparameters
MODEL_TYPE = "wide_deep"
STEPS = 50000  # Number of batches to train
BATCH_SIZE = 32
# Wide (linear) model hyperparameters
LINEAR_OPTIMIZER = "adagrad"
LINEAR_OPTIMIZER_LR = 0.0621  # Learning rate
LINEAR_L1_REG = 0.0  # Regularization rate for FtrlOptimizer
LINEAR_L2_REG = 0.0
LINEAR_MOMENTUM = 0.0  # Momentum for MomentumOptimizer or RMSPropOptimizer
# DNN model hyperparameters
DNN_OPTIMIZER = "adadelta"
DNN_OPTIMIZER_LR = 0.1
DNN_L1_REG = 0.0  # Regularization rate for FtrlOptimizer
DNN_L2_REG = 0.0
DNN_MOMENTUM = 0.0  # Momentum for MomentumOptimizer or RMSPropOptimizer
# Layer dimensions. Defined as follows to make this notebook runnable from Hyperparameter tuning services like AzureML Hyperdrive
DNN_HIDDEN_LAYER_1 = 0  # Set 0 to not use this layer
DNN_HIDDEN_LAYER_2 = 64  # Set 0 to not use this layer
DNN_HIDDEN_LAYER_3 = 128  # Set 0 to not use this layer
DNN_HIDDEN_LAYER_4 = 512  # Note, at least one layer should have nodes.
DNN_HIDDEN_UNITS = [h for h in
                    [DNN_HIDDEN_LAYER_1, DNN_HIDDEN_LAYER_2, DNN_HIDDEN_LAYER_3,
                     DNN_HIDDEN_LAYER_4] if h > 0]
DNN_USER_DIM = 32  # User embedding feature dimension
DNN_ITEM_DIM = 16  # Item embedding feature dimension
DNN_DROPOUT = 0.8
DNN_BATCH_NORM = 1  # 1 to use batch normalization, 0 if not.

# /////////////////////////////////////////////////////////////////////////////////////

# ////////////////////////////////////////////////////////////// Dataset

use_preset = (TRAIN_PICKLE_PATH is not None and TEST_PICKLE_PATH is not None)
if not use_preset:
    # The genres of each movie are returned as '|' separated string, e.g. "Animation|Children's|Comedy".
    data = movielens.load_pandas_df(
        size=MOVIELENS_DATA_SIZE,
        header=[USER_COL, ITEM_COL, RATING_COL],
        genres_col=ITEM_FEAT_COL
    )

# //////////////////////////////////////////////////////////////// Preprocessing
# Encode 'genres' into int array (multi-hot representation) to use as item features
genres_encoder = sklearn.preprocessing.MultiLabelBinarizer()
data[ITEM_FEAT_COL] = genres_encoder.fit_transform(
    data[ITEM_FEAT_COL].apply(lambda s: s.split("|"))
).tolist()
print("Genres:", genres_encoder.classes_)


train, test = python_random_split(data, ratio=0.75, seed=RANDOM_SEED)

print("{} train samples and {} test samples".format(len(train), len(test)))

# Unique items in the dataset
if ITEM_FEAT_COL is None:
    items = data.drop_duplicates(ITEM_COL)[[ITEM_COL]].reset_index(drop=True)
    item_feat_shape = None
else:
    items = data.drop_duplicates(ITEM_COL)[[ITEM_COL, ITEM_FEAT_COL]].reset_index(
        drop=True)
    item_feat_shape = len(items[ITEM_FEAT_COL][0])

# Unique users in the dataset
users = data.drop_duplicates(USER_COL)[[USER_COL]].reset_index(drop=True)

# /////////////////////////////////////////////////////////////////////////////////////

cols = {
    'col_user': USER_COL,
    'col_item': ITEM_COL,
    'col_rating': RATING_COL,
    'col_prediction': PREDICT_COL,
}

train_fn = tf_utils.pandas_input_fn(
    df=train,
    y_col=RATING_COL,
    batch_size=32,
    num_epochs=None,  # We use steps=TRAIN_STEPS instead.
    shuffle=True,
)


