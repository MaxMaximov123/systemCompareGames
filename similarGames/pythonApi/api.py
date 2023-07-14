import flask
from flask import jsonify, Flask, request
import model2
import json

app = Flask(__name__)

blueprint = flask.Blueprint(
    'jobs_api',
    __name__,
)


@blueprint.route('/api/names', methods=['POST'])
def get_news():
    if not request.json:
        return jsonify({'error': 'Empty request'})
    res = {
        "n1": str(model2.forecast(request.json['game1Name1'], request.json['game2Name1'])[0]),
        "n2": str(model2.forecast(request.json['game1Name2'], request.json['game2Name2'])[0]),
    }
    return jsonify(res)


if __name__ == '__main__':
    app.register_blueprint(blueprint)
    app.run(port=3202)
