from pydantic import BaseModel, Field
from enum import Enum

class Subject(str, Enum):
    english = "english"

class Level(str, Enum):
    grade_11 = "grade 11"
    grade_12 = "grade 12"

class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class Input(BaseModel):
    subject: Subject
    content: str
    level: Level
    difficulty: Difficulty
    num_questions: int = Field(..., ge=1, le=100)
