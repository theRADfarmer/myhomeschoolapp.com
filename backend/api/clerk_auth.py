import requests
import jwt
from decouple import config
from rest_framework import authentication, exceptions
from django.conf import settings

CLERK_JWKS_URL = settings.CLERK_JWKS_URL
CLERK_CLIENT_ID = settings.CLERK_AUDIENCE

class ClerkUser:
    def __init__(self, clerk_user_id):
        self.clerk_user_id = clerk_user_id
        self.is_authenticated = True
    def __str__(self):
        return self.clerk_user_id

class ClerkAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]
        try:
            jwks = requests.get(CLERK_JWKS_URL).json()
            public_keys = {key['kid']: jwt.algorithms.RSAAlgorithm.from_jwk(key) for key in jwks['keys']}
            unverified_header = jwt.get_unverified_header(token)
            key = public_keys[unverified_header['kid']]
            payload = jwt.decode(token, key=key, algorithms=['RS256'], audience=CLERK_CLIENT_ID)
            clerk_user_id = payload['sub']
        except Exception as ex:
            print(ex)
            raise exceptions.AuthenticationFailed('Invalid Clerk token')

        return (ClerkUser(clerk_user_id), None)

