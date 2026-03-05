from pydantic import BaseModel, Field, field_validator


class PredictRequest(BaseModel):
    sequence: list[int] = Field(..., min_length=1, max_length=4096)

    @field_validator("sequence")
    @classmethod
    def validate_ids(cls, v):
        for val in v:
            if val < 0:
                raise ValueError("Action IDs must be non-negative integers.")
        return v


class AttributeResult(BaseModel):
    attr_1: int
    attr_2: int
    attr_3: int
    attr_4: int
    attr_5: int
    attr_6: int
    probabilities: list[float]


class ExplainResult(BaseModel):
    token_importance: list[float]


class SimilarSequence(BaseModel):
    customer_id: str
    sequence_snippet: list[int]
    similarity: float


class PredictResponse(BaseModel):
    prediction:        AttributeResult
    explainability:    ExplainResult
    similar_sequences: list[SimilarSequence]
