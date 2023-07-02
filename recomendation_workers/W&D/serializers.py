from pydantic import BaseModel


class MovieUpdate(BaseModel):
    userID: int = 507
    itemID: int = 222
    rating: int = 5


class UserUpdate(BaseModel):
    userID: int = 507