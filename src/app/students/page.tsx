"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Student = {
  id: number; // match DB type
  name: string;
  email: string;
  course_id: number; // store course id
  status: string;
};

type Course = {
  id: number;
  name: string;
  status: "Active" | "Inactive";
};

export default function StudentPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    course_id: 0,
    status: "Active",
  });
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("students").select("*");
    if (error) console.error("Error fetching students:", error.message);
    else if (data) setStudents(data);
    setLoading(false);
  };

  // Fetch active courses
  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("status", "Active");
    if (error) console.error("Error fetching courses:", error.message);
    else if (data) setCourses(data);
  };

  // Add or Edit student
  const saveStudent = async () => {
    if (!newStudent.name || !newStudent.email || !newStudent.course_id) {
      alert("Please fill all fields!");
      return;
    }

    if (editingStudent) {
      // Edit
      const { data, error } = await supabase
        .from("students")
        .update(newStudent)
        .eq("id", editingStudent.id)
        .select();
      if (error) console.error("Error updating student:", error.message);
      else if (data) {
        setStudents(students.map((s) => (s.id === editingStudent.id ? data[0] : s)));
        showSuccess("Student updated successfully!");
        resetForm();
      }
    } else {
      // Add
      const { data, error } = await supabase.from("students").insert([newStudent]).select();
      if (error) console.error("Error adding student:", error.message);
      else if (data) {
        setStudents([...students, data[0]]);
        showSuccess("Student added successfully!");
        resetForm();
      }
    }
  };

  // Delete student
  const deleteStudent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) console.error("Error deleting student:", error.message);
    else {
      setStudents(students.filter((s) => s.id !== id));
      showSuccess("Student deleted successfully!");
    }
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setNewStudent({
      name: student.name,
      email: student.email,
      course_id: student.course_id,
      status: student.status,
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setModalOpen(false);
    setEditingStudent(null);
    setNewStudent({ name: "", email: "", course_id: 0, status: "Active" });
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
      <h1 className="text-3xl font-bold mb-2">Students</h1>
      <p className="text-gray-600 mb-6">Manage student information and records</p>

      <button
        onClick={() => setModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
      >
        + Add Student
      </button>

      {loading ? (
        <p>Loading students...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Course</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const course = courses.find((c) => c.id === student.course_id);
                return (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{student.id}</td>
                    <td className="py-2 px-4">{student.name}</td>
                    <td className="py-2 px-4">{student.email}</td>
                    <td className="py-2 px-4">{course ? course.name : "N/A"}</td>
                    <td className="py-2 px-4">{student.status}</td>
                    <td className="py-2 px-4 space-x-2">
                      <button
                        onClick={() => openEditModal(student)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteStudent(student.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingStudent ? "Edit Student" : "Add New Student"}
            </h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="email"
                placeholder="Email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              />
              <select
                value={newStudent.course_id}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, course_id: parseInt(e.target.value) })
                }
                className="border px-3 py-2 rounded w-full"
              >
                <option value={0}>Select Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              <select
                value={newStudent.status}
                onChange={(e) => setNewStudent({ ...newStudent, status: e.target.value })}
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
                onClick={saveStudent}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingStudent ? "Update" : "Add"}
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
