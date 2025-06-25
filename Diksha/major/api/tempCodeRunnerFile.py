from flask import Flask, render_template, request, url_for
import pickle
from utils.preprocess import preprocess_user_ingredients
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import os
from ast import literal_eval
