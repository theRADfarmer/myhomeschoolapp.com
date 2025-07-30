import React from "react";
import { useAuth } from "@clerk/astro/react";

const VITE_API_URL = import.meta.env.PUBLIC_VITE_API_URL;

const { useState } = React;

const AddStudent = ({ onStudentAdded }) => {
    const { getToken } = useAuth();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
            const token = await getToken({ template: "django" });
            const response = await fetch(`${VITE_API_URL}/students/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    birth_date: birthDate,
                }),
            });
    
        if (!response.ok) {
            throw new Error("Failed to add student. Please refresh and try again.");
        }
    
        const newStudent = await response.json();
        onStudentAdded(newStudent);
        setFirstName("");
        setLastName("");
        setBirthDate("");
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
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
                <input
                    className="w-1/4 border p-1"
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
                <input
                    className="w-1/4 border p-1"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                />
                <button className="w-1/4 border p-1 hover:cursor-pointer hover:text-secondary" type="submit" disabled={loading}>
                    {error ? <p className="text-danger">{error}</p>: loading ? "Adding..." : "Add Student"}
                </button>
            </div>

            {/* Mobile view */}
            <div className="border p-4 rounded shadow md:hidden">
                <label htmlFor="first-name">
                    <span className="font-bold">First Name:</span>
                    <input
                        className="w-full border p-1 block"
                        id="first-name"
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </label>
                <label htmlFor="last-name">
                    <span className="font-bold">Last Name:</span>
                    <input
                        className="w-full border p-1 block"
                        id="last-name"
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </label>
                <label htmlFor="birth-date">
                    <span className="font-bold">Birthday</span>
                    <input
                        className="w-full border p-1 block"
                        id="birth-date"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        required
                    />
                </label>
                <button className="w-full mt-2 p-2 rounded bg-primary hover:bg-secondary hover:cursor-pointer" type="submit" disabled={loading}>
                    {error ? <p>{error}</p>: loading ? "Adding..." : "Add Student"}
                </button>
            </div>
        </form>
    );
};

export default AddStudent;