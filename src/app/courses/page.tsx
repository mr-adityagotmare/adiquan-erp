"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Course = {
  id: number;
  name: string;
  status: "Active" | "Inactive";
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase.from("courses").select("*");
    if (error) console.error("Error fetching courses:", error.message);
    else if (data) setCourses(data);
    setLoading(false);
  };

  const addCourse = async () => {
    if (!newCourseName) return alert("Enter course name");
    const { data, error } = await supabase
      .from("courses")
      .insert([{ name: newCourseName, status: "Active" }])
      .select();
    if (error) console.error("Error adding course:", error.message);
    else if (data) {
      setCourses([...courses, data[0]]);
      setModalOpen(false);
      setNewCourseName("");
      setSuccessMessage("Course added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const deleteCourse = async (id: number) => {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) console.error("Error deleting course:", error.message);
    else setCourses(courses.filter((c) => c.id !== id));
  };

  const toggleStatus = async (course: Course) => {
    const newStatus = course.status === "Active" ? "Inactive" : "Active";
    const { error } = await supabase
      .from("courses")
      .update({ status: newStatus })
      .eq("id", course.id);
    if (error) console.error("Error updating status:", error.message);
    else setCourses(
      courses.map((c) => (c.id === course.id ? { ...c, status: newStatus } : c))
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Courses</h1>
      <p className="text-gray-600 mb-6">Manage courses for students and teachers</p>

      <div className="mb-4">
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Course
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-2 bg-green-500 text-white rounded">
          {successMessage}
        </div>
      )}

      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{course.id}</td>
                  <td className="py-2 px-4">{course.name}</td>
                  <td className="py-2 px-4">{course.status}</td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      onClick={() => toggleStatus(course)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Toggle Status
                    </button>
                    <button
                      onClick={() => deleteCourse(course.id)}
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-xl font-bold mb-4">Add Course</h2>
            <input
              type="text"
              placeholder="Course name"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={addCourse}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
