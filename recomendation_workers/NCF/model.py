import pandas as pd
import numpy as np
import tensorflow as tf
tf.get_logger().setLevel('ERROR') # only show error messages

from recommenders.utils.timer import Timer
from recommenders.models.ncf.ncf_singlenode import NCF
from recommenders.evaluation.python_evaluation import (rmse, mae, rsquared, exp_var, map_at_k, ndcg_at_k, precision_at_k,
                                                     recall_at_k, get_top_k_items)

import data

model = NCF (
    n_users=data.data.n_users,
    n_items=data.data.n_items,
    model_type="NeuMF",
    n_factors=4,
    layer_sizes=[16,8,4],
    n_epochs=data.EPOCHS,
    batch_size=data.BATCH_SIZE,
    learning_rate=1e-3,
    verbose=10,
    seed=data.SEED
)





# eval_map = map_at_k(test, all_predictions, col_prediction='prediction', k=TOP_K)
# eval_ndcg = ndcg_at_k(test, all_predictions, col_prediction='prediction', k=TOP_K)
# eval_precision = precision_at_k(test, all_predictions, col_prediction='prediction', k=TOP_K)
# eval_recall = recall_at_k(test, all_predictions, col_prediction='prediction', k=TOP_K)
#
# print("MAP:\t%f" % eval_map,
#       "NDCG:\t%f" % eval_ndcg,
#       "Precision@K:\t%f" % eval_precision,
#       "Recall@K:\t%f" % eval_recall, sep='\n')
#
#
#
# k = TOP_K
#
# ndcgs = []
# hit_ratio = []
#
# for b in data.test_loader():
#     user_input, item_input, labels = b
#     output = model.predict(user_input, item_input, is_list=True)
#
#     output = np.squeeze(output)
#     rank = sum(output >= output[0])
#     if rank <= k:
#         ndcgs.append(1 / np.log(rank + 1))
#         hit_ratio.append(1)
#     else:
#         ndcgs.append(0)
#         hit_ratio.append(0)
#
# eval_ndcg = np.mean(ndcgs)
# eval_hr = np.mean(hit_ratio)
#
# print("HR:\t%f" % eval_hr)
# print("NDCG:\t%f" % eval_ndcg)



#/////////////////////////////////////


# https://github.com/microsoft/recommenders/blob/main/examples/02_model_collaborative_filtering/ncf_deep_dive.ipynb