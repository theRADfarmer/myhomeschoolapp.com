import React from "react";
import { useAuth } from "@clerk/astro/react";
const { useState } = React;

const AddSubject = ({ studentId, onSubjectAdded }) => {
    const { getToken } = useAuth();

    const [name, setName] = useState("");
    const [courseDescription, setCourseDescription] = useState("");
    const [notes, setNotes] = useState("");

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
            const token = await getToken({ template: "django" });
            const response = await fetch(`http://127.0.0.1:8000/api/subjects/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    student: studentId,
                    name: name,
                    course_description: courseDescription,
                    notes: notes,
                }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to add subject. Please refresh and try again.");
            }
        
            const newStudent = await response.json();
            onSubjectAdded(newStudent);
            setName("");
            setCourseDescription("");
            setNotes("");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form className="w-full" onSubmit={handleSubmit}>
            {/* Desktop Table view */}
            <div className="hidden md:flex md:flex-row">
                <input
                    className="w-1/4 border p-1"
                    type="text"
                    placeholder="Subject Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    className="w-1/4 border p-1"
                    type="text"
                    placeholder="Course Description"
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                />
                <input
                    className="w-1/4 border p-1"
                    type="text"
                    placeholder="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <button className="w-1/4 border p-1 hover:cursor-pointer hover:text-secondary" type="submit" disabled={loading}>
                    {error ? <p className="text-danger">{error}</p>: loading ? "Adding..." : "Add Subject"}
                </button>
            </div>

            {/* Mobile View */}
            <div className="border p-4 rounded shadow md:hidden">
                <label htmlFor="name">
                    <span className="font-bold">Subject Name:</span>
                    <input
                        className="w-full border p-1 block"
                        id="name"
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </label>
                <label htmlFor="course-description">
                    <span className="font bold">Course Description:</span>
                    <input
                        className="w-full border p-1 block"
                        id="course-description"
                        type="text"
                        placeholder="Course Description"
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                    />
                </label>
                <label htmlFor="notes">
                    <span className="font bold">Notes:</span>
                    <input
                        className="w-full border p-1 block"
                        id="notes"
                        type="text"
                        placeholder="Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </label>
                <button className="w-full mt-2 p-2 rounded bg-primary hover:bg-secondary hover:cursor-pointer" type="submit" disabled={loading}>
                    {error ? <p>{error}</p>: loading ? "Adding..." : "Add Subject"}
                </button>
            </div>
        </form>
    );
};

export default AddSubject;