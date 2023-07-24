import requests

print(requests.post('http://localhost:5000/api/names', json={"game1Name1":"Atlantis FC II","game2Name1":"Osters IF","game1Name2":"TiPS Vantaa","game2Name2":"Skovde AIK"}).json())