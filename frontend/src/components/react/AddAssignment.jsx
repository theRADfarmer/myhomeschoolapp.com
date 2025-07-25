import React from "react";
import { useAuth } from "@clerk/astro/react";
const { useState } = React;

const AddAssignment = ({ studentId, subjectId, onAssignmentAdded }) => {
    const { getToken } = useAuth();

    const [name, setName] = useState("");
    const [notes, setNotes] = useState("");
    const [dateCompleted, setDateCompleted] = useState("");
    const [grade, setGrade] = useState("");

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
            const token = await getToken({ template: "django" });
            const response = await fetch(`http://127.0.0.1:8000/api/assignments/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    student: studentId,
                    subject: subjectId,
                    name: name,
                    notes: notes,
                    date_completed: dateCompleted ? dateCompleted : null,
                    grade: grade,
                }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to add assignment. Please refresh and try again.");
            }
        
            const newAssignment = await response.json();
            onAssignmentAdded(newAssignment);
            setName("");
            setNotes("");
            setDateCompleted("");
            setGrade("");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form className="w-full" onSubmit={handleSubmit}>
            {/* Desktop table view */}
            <div className="hidden md:flex md:flex-row">
                <input
                    className="w-1/5 border p-1"
                    type="text"
                    placeholder="Assignment Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    className="w-1/5 border p-1"
                    type="text"
                    placeholder="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <input
                    className="w-1/5 border p-1"
                    type="date"
                    placeholder="Date Completed"
                    value={dateCompleted}
                    onChange={(e) => setDateCompleted(e.target.value)}
                />
                <input
                    className="w-1/5 border p-1"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                />
                <button className="w-1/5 border p-1 hover:cursor-pointer hover:text-secondary" type="submit" disabled={loading}>
                    {error ? <p>{error}</p>: loading ? "Adding..." : "Add Assignment"}
                </button>
            </div>

            {/* Mobile View */}
            <div className="border p-4 rounded shadow md:hidden">
                <label htmlFor="name">
                    <span className="font-bold">Assignment Name:</span>
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
                <label htmlFor="date-completed">
                    <span className="font bold">Date Completed:</span>
                    <input
                        className="w-full border p-1 block"
                        id="date-completed"
                        type="date"
                        placeholder="Date Completed"
                        value={dateCompleted}
                        onChange={(e) => setDateCompleted(e.target.value)}
                    />
                </label>
                <label htmlFor="grade">
                    <span className="font bold">Grade:</span>
                    <input
                        className="w-full border p-1 block"
                        id="grade"
                        type="number"
                        placeholder="Grade"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                    />
                </label>
                <button className="w-full mt-2 p-2 rounded bg-primary hover:bg-secondary hover:cursor-pointer" type="submit" disabled={loading}>
                    {error ? <p>{error}</p>: loading ? "Adding..." : "Add Assignment"}
                </button>
            </div>
        </form>
    );
};

export default AddAssignment;