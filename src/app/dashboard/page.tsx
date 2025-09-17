"use client";
import DashboardLayout from "./layout";
import Link from "next/link";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Welcome to AdiQuan ERP 🎉</h1>
        <p>Select a module from the sidebar or below cards to get started.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <Link href="/students">
            <div className="p-4 bg-white shadow rounded-lg text-center hover:bg-gray-100 cursor-pointer transition">
              <h2 className="font-bold text-lg">Students</h2>
              <p className="text-sm text-gray-600 mt-1">Manage student information and records</p>
            </div>
          </Link>

          <Link href="/teacher">
            <div className="p-4 bg-white shadow rounded-lg text-center hover:bg-gray-100 cursor-pointer transition">
              <h2 className="font-bold text-lg">Teachers</h2>
              <p className="text-sm text-gray-600 mt-1">Manage teacher details and assignments</p>
            </div>
          </Link>


          <Link href="/courses">
            <div className="p-4 bg-white shadow rounded-lg text-center hover:bg-gray-100 cursor-pointer transition">
              <h2 className="font-bold text-lg">Courses</h2>
              <p className="text-sm text-gray-600 mt-1">Add and remove courses</p>
            </div>
          </Link>

          <Link href="/attendance">
            <div className="p-4 bg-white shadow rounded-lg text-center hover:bg-gray-100 cursor-pointer transition">
              <h2 className="font-bold text-lg">Attendance</h2>
              <p className="text-sm text-gray-600 mt-1">Track student attendance daily</p>
            </div>
          </Link>

          <Link href="/fees">
            <div className="p-4 bg-white shadow rounded-lg text-center hover:bg-gray-100 cursor-pointer transition">
              <h2 className="font-bold text-lg">Fees</h2>
              <p className="text-sm text-gray-600 mt-1">Manage student fee payments</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
