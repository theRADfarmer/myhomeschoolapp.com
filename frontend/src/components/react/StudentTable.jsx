import React from "react";
import { useAuth } from "@clerk/astro/react";
import { parseISO } from "date-fns";

import AddStudent from "./AddStudent";
import EditableCell from "./EditableCell";
import InlineEditingInput from "./InlineEditingInput";

const { useState, useEffect } = React;

const StudentTable = () => {
  const { getToken } = useAuth();
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingCell, setEditingCell] = useState({
    id: null,
    field: null,
  });
  const [editValue, setEditValue] = useState("");

  const saveField = async (id, field, newValue) => {
    try {
      const token = await getToken({ template: "django" });
      const resp = await fetch(
        `http://127.0.0.1:8000/api/students/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ [field]: newValue }),
        }
      );

      if (resp.status == 403) {
        throw new Error("Hmmm. For some odd reason, you can't edit that student. Try refreshing the page.");
      } else if (resp.statuc == 404) {
        throw new Error("I'm not sure why this error would ever show. That probably doesn't exist.");
      } else if (!resp.ok) {
        throw new Error("I'm not sure what's going on, but it's definately not right");
      }

      setStudents((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, [field] : newValue} : s
        )
      );

    } catch (err) {
      setError(err);
      console.error("Failed to edit student:", err);
    } finally {
      setLoading(false);
      setEditingCell({ id: null, field: null });
    }
  };

  const handleStudentDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this student?")) {
      return;
    }
    try {
      const token = await getToken({ template: "django" });
      const resp = await fetch(
          `http://127.0.0.1:8000/api/students/${id}`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (resp.status == 403) {
          throw new Error("Hmmm. For some odd reason, you can't delete that student. Try refreshing the page.");
        } else if (resp.statuc == 404) {
          throw new Error("I'm not sure why this error would ever show. That probably doesn't exist.");
        } else if (!resp.ok) {
          throw new Error("I'm not sure what's going on, but it's definately not right");
        }

        setStudents((prev) =>
          prev.filter((s) =>
            s.id !== id
          )
        );

    } catch (err) {
      setError(err);
        console.error("Failed to delete student:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = await getToken({ template: "django" });
        const resp = await fetch(
          "http://127.0.0.1:8000/api/students/",
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            }
          }
        );
        if (resp.status == 403) {
          throw new Error("You don't have permission to access that.");
        } else if (resp.status == 404) {
          throw new Error("That probably doesn't exist.");
        } else if (!resp.ok) {
          throw new Error("I'm not sure what's going on, but it's definately not right");
        }

        const data = await resp.json();
        setStudents(data);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch students:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p className="text-red-600">{error.message}</p>
  }


  return (
    <div>
      {error && <p className="text-danger">{error.message}</p>}
      <div className="hidden md:block overflow-x-auto">
        <table className="border-collapse border w-full table-fixed">
          <thead>
            <tr>
              <th className="border p-1">First Name</th>
              <th className="border p-1">Last Name</th>
              <th className="border p-1">Birthday</th>
              <th className="border p-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <EditableCell
                  value={student.first_name}
                  type="text"
                  onSave={(newValue) =>
                    saveField(student.id, "first_name", newValue)
                  }
                />

                <EditableCell
                  value={student.last_name}
                  type="text"
                  onSave={(newValue) =>
                    saveField(student.id, "last_name", newValue)
                  }
                />

                <EditableCell 
                  value={parseISO(student.birth_date).toLocaleDateString()}
                  type="date"
                  onSave={(newValue) =>
                    saveField(student.id, "birth_date", newValue)
                  }
                />

                <td className="border p-1 w-1/4">
                  <div className="flex flex-row gap-2">
                    <a 
                      className="bg-primary hover:bg-secondary text-light-neutral text-center hover:cursor-pointer p-2 rounded w-1/2"
                      href={`/students/${student.id}/subjects`}
                    >
                      View Subjects
                    </a>
                    <button 
                      className="bg-danger hover:bg-red-400 text-light-neutral hover:cursor-pointer p-2 rounded w-1/2"
                      onClick={() => handleStudentDelete(student.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-2 mb-2">
        {students.map((student) => (
          <div key={student.id} className="border p-4 rounded shadow">
            <div>
              <strong>First Name:</strong>
              <InlineEditingInput
                value={student.first_name}
                type="text"
                onSave={(newValue) =>
                  saveField(student.id, "first_name", newValue)
                }
              />
            </div>
            <div>
              <strong>Last Name:</strong>
              <InlineEditingInput
                value={student.last_name}
                type="text"
                onSave={(newValue) =>
                  saveField(student.id, "last_name", newValue)
                }
              />
            </div>
            <div>
              <strong>Birthday:</strong>
              <InlineEditingInput
                value={parseISO(student.birth_date).toLocaleDateString()}
                type="date"
                onSave={(newValue) =>
                  saveField(student.id, "birth_date", newValue)
                }
              />
            </div>
            <div className="flex gap-2 mt-2">
              <a
                className="bg-primary hover:bg-secondary text-light-neutral text-center p-2 rounded flex-1"
                href={`/students/${student.id}/subjects`}
              >
                View Subjects
              </a>
              <button
                className="bg-danger hover:bg-red-400 text-light-neutral p-2 rounded flex-1"
                onClick={() => handleStudentDelete(student.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <AddStudent
        client:load
        onStudentAdded={(newStudent) => setStudents((prev) => [...prev, newStudent])}
      />
    </div>
  )
}

export default StudentTable;