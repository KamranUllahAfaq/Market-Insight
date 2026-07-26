from pydantic import BaseModel, ConfigDict, Field

class PromptObject(BaseModel):
    content: str = Field(min_length=1, max_length=12_000)
    id: str
    role: str

class RequestObject(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    prompt: PromptObject
    thread_id: str = Field(alias="threadId", min_length=1, max_length=200)
    response_id: str = Field(alias="responseId", min_length=1, max_length=200)
