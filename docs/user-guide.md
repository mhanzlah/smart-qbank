# Smart QBank — User Guide

Smart QBank is a question bank management system for organizing subjects and topics, generating questions with AI, and reviewing question-bank content.

## Roles

Smart QBank has three user roles:

* **Superuser** — manages users and system-level settings.
* **Editor** — manages subjects, topics, and questions.
* **User** — accesses available question-bank content.

## Subjects

Subjects are the main categories of the question bank.

Editors can:

* Create subjects
* View subjects
* Edit subject information
* Delete subjects

## Topics

Topics are created under subjects and are used to organize questions.

Editors can:

* Create topics manually
* View and manage topics
* Edit topic information
* Delete topics
* Generate topics using AI

### AI Topic Generation

Smart QBank can generate topics based on a subject using the integrated AI model.

The generated topics should be reviewed before being added to the question bank.

## Questions

Questions belong to a specific topic.

Editors can:

* Create questions
* View questions
* Edit questions
* Delete questions
* Review generated questions

Questions contain information such as:

* Question text
* Answer options
* Correct answer
* Difficulty
* Cognitive level
* Explanation
* Review status

## AI Question Generation

Smart QBank can generate MCQs for a selected topic using AI.

The generation process can use:

* Number of questions
* Difficulty distribution
* Cognitive levels

Generated questions should be reviewed for correctness, clarity, and relevance before being approved.

## Question Review

Editors should review AI-generated questions before they are considered ready for use.

During review, check:

1. The question is clear and relevant to the topic.
2. The answer options are valid.
3. Only one option is correct.
4. The correct answer is accurate.
5. The difficulty is appropriate.
6. The cognitive level is appropriate.
7. The explanation is correct and useful.

After review, the question can be given the appropriate review status.

## Typical Workflow

A typical question-bank workflow is:

```text
Create Subject
      ↓
Create / Generate Topics
      ↓
Generate Questions
      ↓
Review Questions
      ↓
Approve / Update Questions
```

AI-generated content is intended to assist the Editor. It should be reviewed before being used as finalized question-bank content.
