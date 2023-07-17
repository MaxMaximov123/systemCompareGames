import requests

print(requests.post('http://127.0.0.1:3000/api/pairs', json={"game1Name1":"Atlantis FC II","game2Name1":"Osters IF","game1Name2":"TiPS Vantaa","game2Name2":"Skovde AIK"}))