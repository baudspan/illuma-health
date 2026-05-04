import requests
try:
    res = requests.get('http://127.0.0.1:8000/api/patients')
    print("Status:", res.status_code)
    print("Body:", res.text)
except Exception as e:
    print(e)
