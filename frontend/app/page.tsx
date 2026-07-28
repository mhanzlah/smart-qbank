"use client";

import { useState } from "react";

export default function Home() {
  const [mcqs, setMCQS] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    difficulty: "easy",
    level: "grade 11",
    num_questions: 5,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "num_questions" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const response = await fetch("http://localhost:8000/process", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        console.error("Request failed", response.status);
      }

      const data = await response.json();

      setMCQS(data.response);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <main className="mt-4">
        <div className="w-1/3 mx-auto">
          <h2 className="text-center text-lg font-semibold mb-5">
            Generate MCQs effortlessly
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="subject" className="cursor-pointer text-sm">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="block w-full border rounded px-2 py-1"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="content" className="cursor-pointer text-sm">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="block w-full border rounded px-2 py-1"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="difficulty" className="cursor-pointer text-sm">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="block w-full border rounded px-1 py-1"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="level" className="cursor-pointer text-sm">
                Student Level/Class
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="block w-full border rounded px-1 py-1"
              >
                <option value="grade 11">Grade 11</option>
                <option value="grade 12">Grade 12</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="num_questions" className="cursor-pointer text-sm">
                Number of Questions
              </label>
              <input
                type="number"
                id="num_questions"
                name="num_questions"
                min={1}
                max={5}
                step={1}
                value={formData.num_questions}
                onChange={handleChange}
                className="block w-full border rounded px-2 py-1"
              />
            </div>

            <button className="border rounded py-1 w-full cursor-pointer hover:font-semibold active:scale-99">
              Generate MCQs
            </button>
          </form>
        </div>
        <hr className="my-6" />
        <div className="mx-auto w-1/3">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            mcqs?.questions.map((mcq, idx) => (
              <div key={mcq.question_number}>
                <h3>
                  {idx + 1}. {mcq.question_text}
                </h3>

                <p>A. {mcq.options.A}</p>
                <p>B. {mcq.options.B}</p>
                <p>C. {mcq.options.C}</p>
                <p>D. {mcq.options.D}</p>

                <strong>Answer: {mcq.correct_answer}</strong>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
