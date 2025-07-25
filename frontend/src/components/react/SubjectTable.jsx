import React from 'react';
import { useAuth } from '@clerk/astro/react';

import EditableCell from "./EditableCell";
import AddSubject from './AddSubject';
import InlineEditingInput from './InlineEditingInput';

const { useState, useEffect } = React;

const SubjectTable = ({ studentId }) => {
  const { getToken } = useAuth();
  const [subjects, setSubjects] = useState([]);

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
        `http://127.0.0.1:8000/api/subjects/${id}`,
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
        throw new Error("Hmmm. For some odd reason, you can't edit that subject. Try refreshing the page.");
      } else if (resp.statuc == 404) {
        throw new Error("I'm not sure why this error would ever show. That probably doesn't exist.");
      } else if (!resp.ok) {
        throw new Error("I'm not sure what's going on, but it's definately not right");
      }

      setSubjects((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, [field] : newValue} : s
        )
      );

    } catch (err) {
      setError(err);
      console.error("Failed to edit subject:", err);
    } finally {
      setLoading(false);
      setEditingCell({ id: null, field: null });
    }
  };

  const handleSubjectDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this subject?")) {
      return;
    }
    try {
      const token = await getToken({ template: "django" });
      const resp = await fetch(
          `http://127.0.0.1:8000/api/subjects/${id}`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (resp.status == 403) {
          throw new Error("Hmmm. For some odd reason, you can't delete that subject. Try refreshing the page.");
        } else if (resp.status == 404) {
          throw new Error("I'm not sure why this error would ever show. That probably doesn't exist.");
        } else if (!resp.ok) {
          throw new Error("I'm not sure what's going on, but it's definately not right");
        }

        setSubjects((prev) =>
          prev.filter((s) =>
            s.id !== id
          )
        );

    } catch (err) {
      setError(err);
        console.error("Failed to delete subject:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = await getToken({ template: "django" });
        const resp = await fetch(
          `http://127.0.0.1:8000/api/subjects/?student=${studentId}`,
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
        setSubjects(data);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch subjects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
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
              <th className="border p-1">Subject Name</th>
              <th className="border p-1">Course Description</th>
              <th className="border p-1">Notes</th>
              <th className="border p-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <EditableCell
                  value={subject.name}
                  type="text"
                  onSave={(newValue) => 
                    saveField(subject.id, "name", newValue)
                  }
                />
                <EditableCell
                  value={subject.course_description}
                  type="text"
                  onSave={(newValue) => 
                    saveField(subject.id, "course_description", newValue)
                  }
                />
                <EditableCell
                  value={subject.notes}
                  type="text"
                  onSave={(newValue) => 
                    saveField(subject.id, "notes", newValue)
                  }
                />
                <td className="border p-1 w-1/4">
                  <div className="flex flex-row gap-2">
                    <a 
                      className="bg-primary hover:secondary text-light-neutral text-center hover:cursor-pointer p-2 rounded w-1/2"
                      href={`/students/${studentId}/subjects/${subject.id}/assignments`}
                    >
                      View Assignments
                    </a>
                    <button 
                      className="bg-danger hover:bg-red-400 text-light-neutral hover:cursor-pointer p-2 rounded w-1/2"
                      onClick={() => handleSubjectDelete(subject.id)}
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
        {subjects.map((subject) => (
          <div key={subject.id} className="border p-4 rounded shadow">
            <div>
              <strong>Subject Name:</strong>
              <InlineEditingInput
                value={subject.name}
                type="text"
                onSave={(newValue) =>
                  saveField(subject.id, "name", newValue)
                }
              />
            </div>
            <div>
              <strong>Course Description:</strong>
              <InlineEditingInput
                value={subject.course_description}
                type="text"
                onSave={(newValue) =>
                  saveField(subject.id, "course_description", newValue)
                }
              />
            </div>
            <div>
              <strong>Notes:</strong>
              <InlineEditingInput
                value={subject.notes}
                type="text"
                onSave={(newValue) =>
                  saveField(subject.id, "notes", newValue)
                }
              />
            </div>
            <div className="flex gap-2 mt-2">
              <a
                className="bg-primary hover:bg-secondary text-light-neutral text-center p-2 rounded flex-1"
                href={`/students/${studentId}/subjects/${subject.id}/assignments`}
              >
                View Assignments
              </a>
              <button
                className="bg-danger hover:bg-red-400 text-light-neutral p-2 rounded flex-1"
                onClick={() => handleSubjectDelete(subject.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <AddSubject
        client:load
        studentId={studentId} 
        onSubjectAdded={(newSubject) => setSubjects((prev) => [...prev, newSubject])}
      />
    </div>
  );
}

export default SubjectTable;