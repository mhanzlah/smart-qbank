"use client";

import { useState } from "react";

export default function Home() {
  const [mcqs, setMCQS] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    topics: [],
    level: "undergrad",
    distribution: {easy:5, medium:3, hard:2},
  });

const handleChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >
) => {
  const { name, value, type } = e.target;

  if (name === "easy" || name === "medium" || name === "hard") {
    setFormData((prev) => ({
      ...prev,
      distribution: {
        ...prev.distribution,
        [name]: Number(value),
      },
    }));
  } else if (name === "topics") {
    setFormData((prev) => ({
      ...prev,
      topics: value.split(",").map((t) => t.trim()),
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // const response = await fetch("http://localhost:8000/process", {
      //   method: "post",
      //   headers: { "topics-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });

      // if (!response.ok) {
      //   console.error("Request failed", response.status);
      // }

      // const data = await response.json();

      // setMCQS(data.response);

      console.log(formData);
      
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
              <label htmlFor="topics" className="cursor-pointer text-sm">
                Topics
              </label>
              <input
                id="topics"
                name="topics"
                value={formData.topics}
                onChange={handleChange}
                className="block w-full border rounded px-2 py-1"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="easy" className="cursor-pointer text-sm">
                Easy
              </label>
              <input
                id="easy"
                name="easy"
                value={formData.distribution.easy}
                type = "range"
                min = {1}
                max = {10}
                onChange={handleChange}
                className="block w-full border rounded px-1 py-1"
              >
              </input>
              <span>{formData.distribution.easy}</span>
            </div>
             <div className="mb-4">
              <label htmlFor="medium" className="cursor-pointer text-sm">
                Medium
              </label>
              <input
                id="medium"
                name="medium"
                value={formData.distribution.medium}
                type="range"
                min = {1}
                max = {7}
                onChange={handleChange}
                className="block w-full border rounded px-1 py-1"
              >
              </input>
              <span>{formData.distribution.medium}</span>
            </div>
             <div className="mb-4">
              <label htmlFor="hard" className="cursor-pointer text-sm">
                Hard
              </label>
              <input
                id="hard"
                name="hard"
                value={formData.distribution.hard}
                onChange={handleChange}
                type="range"
                min = {1}
                max = {5}
                className="block w-full border rounded px-1 py-1"
              >
              </input>
              <span>{formData.distribution.hard}</span>
            </div>

            <div className="mb-4">
              <label htmlFor="level" className="cursor-pointer text-sm">
                Student Class
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="block w-full border rounded px-1 py-1"
              >
                <option value="undergrad">Undergraguate</option>
              </select>
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
