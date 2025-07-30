import React from 'react';
import { useAuth } from '@clerk/astro/react';
import { parseISO } from 'date-fns';

import EditableCell from "./EditableCell";
import InlineEditingInput from './InlineEditingInput';
import AddAssignment from './AddAssignment';

const VITE_API_URL = import.meta.env.PUBLIC_VITE_API_URL;

const { useState, useEffect } = React;

const AssignmentTable = ({ studentId, subjectId }) => {
  const { getToken } = useAuth();
  const [assignments, setAssignments] = useState([]);

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
        `${VITE_API_URL}/assignments/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ [field]: newValue ? newValue : null }),
        }
      );

      if (resp.status == 403) {
        throw new Error("Hmmm. For some odd reason, you can't edit that assignment. Try refreshing the page.");
      } else if (resp.statuc == 404) {
        throw new Error("I'm not sure why this error would ever show. That probably doesn't exist.");
      } else if (!resp.ok) {
        throw new Error("I'm not sure what's going on, but it's definately not right");
      }

      setAssignments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, [field] : newValue} : a
        )
      );

    } catch (err) {
      setError(err);
      console.error("Failed to edit assignment:", err);
    } finally {
      setLoading(false);
      setEditingCell({ id: null, field: null });
    }
  };

  const handleAssignmentDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this assignment?")) {
      return;
    }
    try {
      const token = await getToken({ template: "django" });
      const resp = await fetch(
          `${VITE_API_URL}/assignments/${id}`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (resp.status == 403) {
          throw new Error("Hmmm. For some odd reason, you can't delete that assignment. Try refreshing the page.");
        } else if (resp.status == 404) {
          throw new Error("I'm not sure why this error would ever show. That probably doesn't exist.");
        } else if (!resp.ok) {
          throw new Error("I'm not sure what's going on, but it's definately not right");
        }

        setAssignments((prev) =>
          prev.filter((a) =>
            a.id !== id
          )
        );

    } catch (err) {
      setError(err);
        console.error("Failed to delete assignment:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = await getToken({ template: "django" });
        const resp = await fetch(
          `${VITE_API_URL}/assignments/?subject=${subjectId}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            }
          }
        );
        if (resp.status == 403) {
          throw new Error("You don't have permission to access that.");
        } else if (resp.statuc == 404) {
          throw new Error("That probably doesn't exist.");
        } else if (!resp.ok) {
          throw new Error("I'm not sure what's going on, but it's definately not right");
        }

        const data = await resp.json();
        setAssignments(data);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch assignments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p className="text-red-500">{error.message}</p>
  }

  return (
    <div>
      {error && <p className="text-danger">{error.message}</p>}
      <div className="hidden md:block overflow-x-auto">
        <table className="border-collapse border w-full table-fixed">
          <thead>
            <tr>
              <th className="border p-1">Assignment Name</th>
              <th className="border p-1">Notes</th>
              <th className="border p-1">Date Completed</th>
              <th className="border p-1">Grade</th>
              <th className="border p-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <EditableCell
                  value={assignment.name}
                  type="text"
                  onSave={(newValue) => 
                    saveField(assignment.id, "name", newValue)
                  }
                />
                <EditableCell
                  value={assignment.notes}
                  type="text"
                  onSave={(newValue) => 
                    saveField(assignment.id, "notes", newValue)
                  }
                />
                <EditableCell
                  value={assignment.date_completed ? parseISO(assignment.date_completed).toLocaleDateString() : ""}
                  type="date"
                  onSave={(newValue) => 
                    saveField(assignment.id, "date_completed", newValue)
                  }
                />
                <EditableCell
                  value={assignment.grade}
                  type="number"
                  onSave={(newValue) => 
                    saveField(assignment.id, "grade", newValue)
                  }
                />
                <td className="border p-1 w-1/4">
                  <div className="px-4">
                    <button 
                      className="bg-red-600 hover:bg-red-400 text-white hover:cursor-pointer p-1 m-1 rounded w-full"
                      onClick={() => handleAssignmentDelete(assignment.id)}
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
        {assignments.map((assignment) => (
          <div key={assignment.id} className="border p-4 rounded shadow">
            <div>
              <strong>Assignment Name:</strong>
              <InlineEditingInput
                value={assignment.name}
                type="text"
                onSave={(newValue) =>
                  saveField(assignment.id, "name", newValue)
                }
              />
            </div>
            <div>
              <strong>Notes:</strong>
              <InlineEditingInput
                value={assignment.notes}
                type="text"
                onSave={(newValue) =>
                  saveField(assignment.id, "notes", newValue)
                }
              />
            </div>
            <div>
              <strong>Date Completed:</strong>
              <InlineEditingInput
                value={assignment.date_completed ? parseISO(assignment.date_completed).toLocaleDateString() : ""}
                type="date"
                onSave={(newValue) =>
                  saveField(assignment.id, "date_completed", newValue)
                }
              />
            </div>
            <div>
              <strong>Grade:</strong>
              <InlineEditingInput
                value={assignment.grade}
                type="number"
                onSave={(newValue) =>
                  saveField(assignment.id, "grade", newValue)
                }
              />
            </div>
            <div className="mt-2">
              <button
                className="bg-danger hover:bg-red-400 text-light-neutral p-2 rounded w-full"
                onClick={() => handleAssignmentDelete(assignment.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <AddAssignment
        client:load
        studentId={studentId}
        subjectId={subjectId} 
        onAssignmentAdded={(newAssignment) => setAssignments((prev) => [...prev, newAssignment])}
      />
    </div>
  );
}

export default AssignmentTable;