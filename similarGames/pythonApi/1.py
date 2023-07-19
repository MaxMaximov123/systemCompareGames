import requests

print(requests.post('https://747c-45-133-172-232.ngrok-free.app/api/pairs', json={"game1Name1":"Atlantis FC II","game2Name1":"Osters IF","game1Name2":"TiPS Vantaa","game2Name2":"Skovde AIK"}).json())