from jose import JWTError

from app.auth.utils import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_hash_and_verify_password():
    hashed = hash_password("my-secret-password")

    assert hashed != "my-secret-password"
    assert verify_password("my-secret-password", hashed) is True
    assert verify_password("wrong-password", hashed) is False


def test_create_and_decode_access_token():
    user_id = "user-123"
    token = create_access_token(user_id)

    assert isinstance(token, str)
    assert decode_token(token) == user_id


def test_decode_invalid_token_raises():
    try:
        decode_token("not-a-valid-jwt")
        assert False, "Expected JWTError"
    except JWTError:
        pass
