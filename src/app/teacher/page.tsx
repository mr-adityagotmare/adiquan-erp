"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Teacher = {
  id: number;
  name: string;
  email: string;
  subject: string;
  status: string;
};

type Course = {
  id: number;
  name: string;
  status: "Active" | "Inactive";
};

export default function TeacherPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    subject: "",
    status: "Active",
  });
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch teachers
  const fetchTeachers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("teachers").select("*");
    if (error) console.error("Error fetching teachers:", error?.message || error);
    else if (data) setTeachers(data);
    setLoading(false);
  };

  // Fetch active courses for subject dropdown
  const fetchCourses = async () => {
    const { data, error } = await supabase.from("courses").select("*").eq("status", "Active");
    if (error) console.error("Error fetching courses:", error?.message || error);
    else if (data) setCourses(data);
  };

  // Add or Edit teacher
  const saveTeacher = async () => {
    if (!newTeacher.name || !newTeacher.email || !newTeacher.subject) {
      alert("Please fill all fields!");
      return;
    }

    if (editingTeacher) {
      // Edit
      const { data, error } = await supabase
        .from("teachers")
        .update(newTeacher)
        .eq("id", editingTeacher.id)
        .select();
      if (error) console.error("Error updating teacher:", error?.message || error);
      else if (data) {
        setTeachers(teachers.map((t) => (t.id === editingTeacher.id ? data[0] : t)));
        showSuccess("Teacher updated successfully!");
        resetForm();
      }
    } else {
      // Add
      const { data, error } = await supabase.from("teachers").insert([newTeacher]).select();
      if (error) console.error("Error adding teacher:", error?.message || error);
      else if (data) {
        setTeachers([...teachers, data[0]]);
        showSuccess("Teacher added successfully!");
        resetForm();
      }
    }
  };

  // Delete teacher
  const deleteTeacher = async (id: number) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    const { error } = await supabase.from("teachers").delete().eq("id", id);
    if (error) console.error("Error deleting teacher:", error?.message || error);
    else {
      setTeachers(teachers.filter((t) => t.id !== id));
      showSuccess("Teacher deleted successfully!");
    }
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setNewTeacher({
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject,
      status: teacher.status,
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setModalOpen(false);
    setEditingTeacher(null);
    setNewTeacher({ name: "", email: "", subject: "", status: "Active" });
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  useEffect(() => {
    fetchTeachers();
    fetchCourses();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
      <h1 className="text-3xl font-bold mb-2">Teachers</h1>
      <p className="text-gray-600 mb-6">Manage teacher details and assignments</p>

      <button
        onClick={() => setModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
      >
        + Add Teacher
      </button>

      {loading ? (
        <p>Loading teachers...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Subject</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{teacher.id}</td>
                  <td className="py-2 px-4">{teacher.name}</td>
                  <td className="py-2 px-4">{teacher.email}</td>
                  <td className="py-2 px-4">{teacher.subject}</td>
                  <td className="py-2 px-4">{teacher.status}</td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      onClick={() => openEditModal(teacher)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTeacher(teacher.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
            </h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="email"
                placeholder="Email"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              />
              <select
                value={newTeacher.subject}
                onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="">Select Subject</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.name}>
                    {course.name}
                  </option>
                ))}
              </select>
              <select
                value={newTeacher.status}
                onChange={(e) => setNewTeacher({ ...newTeacher, status: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={saveTeacher}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingTeacher ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {successMsg && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
          {successMsg}
        </div>
      )}
    </div>
  );
}
