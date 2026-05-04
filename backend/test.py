import urllib.request
import urllib.error

try:
    response = urllib.request.urlopen('http://127.0.0.1:8000/api/patients')
    print(response.read().decode())
except urllib.error.HTTPError as e:
    print(e.read().decode())
