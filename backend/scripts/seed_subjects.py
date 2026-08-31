from sqlmodel import Session

from app.core.db import engine
from app.models.subject import Subject

subjects = [
    Subject(
        name="Programming Fundamentals",
        code="PF",
        clo="""By the end of this course student will be able to:

- Demonstrate proficiency in writing, debugging, and executing basic programs using programming languages such as C or Python.
- Explain core programming concepts including variables, control structures, functions, and data types.
- Develop simple algorithms to solve computational problems.
- Apply best practices in coding to produce efficient and readable programs.
- Analyze program outputs and troubleshoot common errors effectively.""",
    ),
    Subject(
        name="Object Oriented Programming",
        code="OOP",
        clo="""By the end of this course student will be able to:

- Understand and apply the principles of object-oriented programming, including encapsulation, inheritance, and polymorphism.
- Design and implement classes and objects to model real-world entities.
- Write reusable and modular code using OOP concepts.
- Analyze the advantages of OOP over procedural programming paradigms.
- Develop small-scale applications utilizing OOP concepts in languages like Java or C++.""",
    ),
    Subject(
        name="Database Systems",
        code="DBS",
        clo="""By the end of this course student will be able to:

- Design and normalize relational database schemas based on user requirements.
- Write SQL queries for data retrieval, insertion, update, and deletion.
- Explain the concepts of database transactions, concurrency, and recovery.
- Implement basic database management tasks using popular database management systems.
- Analyze the role of databases in information systems and their security considerations.""",
    ),
    Subject(
        name="Calculus and Analytical Geometry",
        code="CAG",
        clo="""By the end of this course student will be able to:

- Understand and apply the fundamental concepts of limits, derivatives, and integrals to solve mathematical problems.
- Analyze and interpret geometric problems involving equations of lines, circles, and conic sections in the coordinate plane.
- Develop problem-solving skills by applying calculus techniques to real-world scenarios in science and engineering.
- Evaluate the behavior of functions through differentiation and integration, including applications such as optimization and area calculations.
- Communicate mathematical reasoning effectively through written explanations and problem-solving procedures.""",
    ),
    Subject(
        name="Linear Algebra",
        code="LA",
        clo="""By the end of this course student will be able to:

- Understand and perform operations on matrices and vectors, including addition, multiplication, and inverse calculations.
- Solve systems of linear equations using matrix methods such as Gaussian elimination and matrix inversion.
- Analyze vector spaces, subspaces, basis, and dimension to understand the structure of linear systems.
- Apply eigenvalues and eigenvectors in solving problems related to transformations and stability analysis.""",
    ),
]


def seed_subjects() -> None:
    with Session(engine) as session:
        session.add_all(subjects)
        session.commit()

    print(f"Seeded {len(subjects)} subjects.")


if __name__ == "__main__":
    seed_subjects()
