import warnings

warnings.filterwarnings("ignore")
from tempfile import TemporaryDirectory
import tensorflow as tf

tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.INFO)

from recommenders.utils.constants import (
    DEFAULT_USER_COL as USER_COL,
    DEFAULT_ITEM_COL as ITEM_COL,
    DEFAULT_GENRE_COL as ITEM_FEAT_COL,
    SEED
)
from recommenders.utils import tf_utils, gpu_utils, plot
import recommenders.models.wide_deep.wide_deep_utils as wide_deep

from data import *

if MODEL_DIR is None:
    TMP_DIR = TemporaryDirectory()
    model_dir = TMP_DIR.name
else:
    if os.path.exists(MODEL_DIR) and os.listdir(MODEL_DIR):
        raise ValueError(
            "Model exists in {}. Use different directory name or "
            "remove the existing checkpoint files first".format(MODEL_DIR)
        )
    TMP_DIR = None
    model_dir = MODEL_DIR

save_checkpoints_steps = max(1, STEPS // 5)

# Define wide (linear) and deep (dnn) features
wide_columns, deep_columns = wide_deep.build_feature_columns(
    users=users[USER_COL].values,
    items=items[ITEM_COL].values,
    user_col=USER_COL,
    item_col=ITEM_COL,
    item_feat_col=ITEM_FEAT_COL,
    crossed_feat_dim=1000,
    user_dim=DNN_USER_DIM,
    item_dim=DNN_ITEM_DIM,
    item_feat_shape=item_feat_shape,
    model_type=MODEL_TYPE,
)

# Build a model based on the parameters
model = wide_deep.build_model(
    model_dir=model_dir,
    wide_columns=wide_columns,
    deep_columns=deep_columns,
    linear_optimizer=tf_utils.build_optimizer(LINEAR_OPTIMIZER, LINEAR_OPTIMIZER_LR, **{
        'l1_regularization_strength': LINEAR_L1_REG,
        'l2_regularization_strength': LINEAR_L2_REG,
        'momentum': LINEAR_MOMENTUM,
    }),
    dnn_optimizer=tf_utils.build_optimizer(DNN_OPTIMIZER, DNN_OPTIMIZER_LR, **{
        'l1_regularization_strength': DNN_L1_REG,
        'l2_regularization_strength': DNN_L2_REG,
        'momentum': DNN_MOMENTUM,
    }),
    dnn_hidden_units=DNN_HIDDEN_UNITS,
    dnn_dropout=DNN_DROPOUT,
    dnn_batch_norm=(DNN_BATCH_NORM == 1),
    log_every_n_iter=max(1, STEPS // 10),  # log 10 times
    save_checkpoints_steps=save_checkpoints_steps,
    seed=RANDOM_SEED
)

# ///////////////////////////////////////////////////////////////////////////////////////////////// Define


# evaluation_logger = tf_utils.MetricsLogger()
# if EVALUATE_WHILE_TRAINING:
#     logs = evaluation_logger.get_log()
#     for i, (m, v) in enumerate(logs.items(), 1):
#         sb.glue("eval_{}".format(m), v)
#         x = [save_checkpoints_steps*i for i in range(1, len(v)+1)]
#         plot.line_graph(
#             values=list(zip(v, x)),
#             labels=m,
#             x_name="steps",
#             y_name=m,
#             subplot=(math.ceil(len(logs)/2), 2, i),
#         )
#
# if len(RATING_METRICS) > 0:
#     predictions = list(model.predict(input_fn=tf_utils.pandas_input_fn(df=test)))
#     prediction_df = test.drop(RATING_COL, axis=1)
#     prediction_df[PREDICT_COL] = [p['predictions'][0] for p in predictions]
#
#     rating_results = {}
#     for m in RATING_METRICS:
#         result = evaluator.metrics[m](test, prediction_df, **cols)
#         sb.glue(m, result)
#         rating_results[m] = result
#     print(rating_results)
#
# # ///////////////////////////////////////////////////////////////////////////////////////////////// Eval

#
# os.makedirs(EXPORT_DIR_BASE, exist_ok=True)
# exported_path = tf_utils.export_model(
#     model=model,
#     train_input_fn=train_fn,
#     eval_input_fn=tf_utils.pandas_input_fn(
#         df=test, y_col=RATING_COL
#     ),
#     tf_feat_cols=wide_columns+deep_columns,
#     base_dir=EXPORT_DIR_BASE
# )
# sb.glue('saved_model_dir', str(exported_path))
# print("Model exported to", str(exported_path))
#
# # ///////////////////////////////////////////////////////////////////////////////////////////////// export
