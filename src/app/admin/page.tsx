'use client';

import { useState, useEffect } from 'react';
import { type Company, type User, type AccessLevel, type UserRole } from '@/../generated/prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { signOut } from 'next-auth/react';

// Define more specific types that include the relations
interface CompanyWithUsers extends Company {
  users: Array<{ user: User }>;
}

interface UserWithCompanies extends User {
  companies: Array<{ company: Company }>;
}

export default function AdminDashboardPage() {
  // Use the new, more detailed types for state
  const [companies, setCompanies] = useState<CompanyWithUsers[]>([]);
  const [users, setUsers] = useState<UserWithCompanies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Company form
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyAccessLevel, setNewCompanyAccessLevel] = useState<AccessLevel>('STANDARD');
  const [newCompanyGaPropertyId, setNewCompanyGaPropertyId] = useState('');
  const [editingCompany, setEditingCompany] = useState<CompanyWithUsers | null>(null);

  // State for User form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserImage, setNewUserImage] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('USER');
  const [newUserCompanyIds, setNewUserCompanyIds] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<UserWithCompanies | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [companiesRes, usersRes] = await Promise.all([
        fetch('/api/admin/companies'),
        fetch('/api/admin/users'),
      ]);

      if (!companiesRes.ok) throw new Error('Failed to fetch companies');
      if (!usersRes.ok) throw new Error('Failed to fetch users');
      
      // Cast the fetched data to our new types
      const companiesData: CompanyWithUsers[] = await companiesRes.json();
      const usersData: UserWithCompanies[] = await usersRes.json();

      setCompanies(companiesData);
      setUsers(usersData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Company CRUD Handlers ---
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCompanyName,
          accessLevel: newCompanyAccessLevel,
          gaPropertyId: newCompanyGaPropertyId || null,
        }),
      });
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to create company');
      }
      setNewCompanyName('');
      setNewCompanyAccessLevel('STANDARD');
      setNewCompanyGaPropertyId('');
      fetchData(); // Refetch all data
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Error creating company.');
    }
  };

  const handleEditCompany = (company: CompanyWithUsers) => {
    setEditingCompany(company);
    setNewCompanyName(company.name);
    setNewCompanyAccessLevel(company.accessLevel);
    setNewCompanyGaPropertyId(company.gaPropertyId || '');
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    try {
      const res = await fetch(`/api/admin/companies/${editingCompany.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCompanyName,
          accessLevel: newCompanyAccessLevel,
          gaPropertyId: newCompanyGaPropertyId || null,
        }),
      });
      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.message || 'Failed to update company');
      }
      setEditingCompany(null);
      setNewCompanyName('');
      setNewCompanyAccessLevel('STANDARD');
      setNewCompanyGaPropertyId('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Error updating company.');
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company? This will also unassign all its users.')) return;
    try {
      const res = await fetch(`/api/admin/companies/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete company');
      }
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Error deleting company.');
    }
  };

  // --- User CRUD Handlers ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserEmail,
          name: newUserName || null,
          image: newUserImage || null,
          role: newUserRole,
          companyIds: newUserCompanyIds,
        }),
      });
       if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
      setNewUserEmail('');
      setNewUserName('');
      setNewUserImage('');
      setNewUserRole('USER');
      setNewUserCompanyIds([]);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Error creating user.');
    }
  };

  const handleEditUser = (user: UserWithCompanies) => {
    setEditingUser(user);
    setNewUserEmail(user.email);
    setNewUserName(user.name || '');
    setNewUserImage(user.image || '');
    setNewUserRole(user.role);
    setNewUserCompanyIds(user.companies.map((c) => c.company.id));
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserEmail,
          name: newUserName || null,
          image: newUserImage || null,
          role: newUserRole,
          companyIds: newUserCompanyIds,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
      setEditingUser(null);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserImage('');
      setNewUserRole('USER');
      setNewUserCompanyIds([]);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Error updating user.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Error deleting user.');
    }
  };

  if (loading) return <div className="text-center p-8">Loading admin data...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <main className="flex min-h-screen flex-col p-4 bg-gray-900 text-white">
      <div className="header flex justify-between items-center border-b border-gray-700 pb-4 mb-8">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <div className="logo">
          <Image alt="dykstra hamel logo" src="/dykstra-hamel-logo.svg" width={300} height={50} />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', width: '150px', height: '50px', borderRadius: '5px', cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Company Management Form */}
        <Card className="flex flex-col bg-gray-800 text-white">
          <CardHeader>
            <CardTitle>{editingCompany ? 'Edit Company' : 'Create New Company'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingCompany ? handleUpdateCompany : handleCreateCompany} className="space-y-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-300">Name:</label>
                <input
                  type="text"
                  id="companyName"
                  className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-300">Access Level:</label>
                <select
                  id="accessLevel"
                  className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                  value={newCompanyAccessLevel}
                  onChange={(e) => setNewCompanyAccessLevel(e.target.value as AccessLevel)}
                >
                  <option value="STANDARD">STANDARD</option>
                  <option value="PREMIUM">PREMIUM</option>
                </select>
              </div>
              <div>
                <label htmlFor="gaPropertyId" className="block text-sm font-medium text-gray-300">GA Property ID:</label>
                <input
                  type="text"
                  id="gaPropertyId"
                  className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                  value={newCompanyGaPropertyId}
                  onChange={(e) => setNewCompanyGaPropertyId(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <Button type="submit">{editingCompany ? 'Update Company' : 'Create Company'}</Button>
              {editingCompany && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditingCompany(null);
                  setNewCompanyName('');
                  setNewCompanyAccessLevel('STANDARD');
                  setNewCompanyGaPropertyId('');
                }} className="ml-2 text-black">
                  Cancel
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* User Management Form */}
        <Card className="flex flex-col bg-gray-800 text-white">
          <CardHeader>
            <CardTitle>{editingUser ? 'Edit User' : 'Create New User'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
              <div>
                <label htmlFor="userEmail" className="block text-sm font-medium text-gray-300">Email:</label>
                <input
                  type="email"
                  id="userEmail"
                  className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-300">Name:</label>
                <input
                  type="text"
                  id="userName"
                  className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label htmlFor="userImage" className="block text-sm font-medium text-gray-300">Image URL:</label>
                <input
                  type="text"
                  id="userImage"
                  className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                  value={newUserImage}
                  onChange={(e) => setNewUserImage(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label htmlFor="userRole" className="block text-sm font-medium text-gray-300">Role:</label>
                <select
                  id="userRole"
                  className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label htmlFor="userCompanies" className="block text-sm font-medium text-gray-300">Assign Companies:</label>
                <select
                  id="userCompanies"
                  multiple
                  className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white h-24"
                  value={newUserCompanyIds}
                  onChange={(e) =>
                    setNewUserCompanyIds(
                      Array.from(e.target.selectedOptions, (option) => option.value)
                    )
                  }
                >
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit">{editingUser ? 'Update User' : 'Create User'}</Button>
              {editingUser && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditingUser(null);
                  setNewUserEmail('');
                  setNewUserName('');
                  setNewUserImage('');
                  setNewUserRole('USER');
                  setNewUserCompanyIds([]);
                }} className="ml-2 text-black">
                  Cancel
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Display Companies Table */}
      <Card className="flex flex-col mt-8 bg-gray-800 text-white">
        <CardHeader>
          <CardTitle>Existing Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700 pb-2 mb-2">
            <div>Name</div>
            <div>Access Level</div>
            <div>GA Property ID</div>
            <div>Users</div>
            <div>Actions</div>
          </div>
          <div className="space-y-2">
            {companies.map((company) => (
              <div key={company.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center border border-gray-700 p-2 rounded-md">
                <div className="font-medium text-white">{company.name}</div>
                <div className="text-gray-300">{company.accessLevel}</div>
                <div className="text-gray-300">{company.gaPropertyId || 'N/A'}</div>
                <div className="text-gray-300 text-xs">
                  {/* THIS LINE IS NOW FIXED */}
                  {company.users?.map(cu => cu.user.name || cu.user.email).join(', ') || 'No users'}
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleEditCompany(company)} className="text-indigo-400 hover:text-indigo-300 mr-2">
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteCompany(company.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Display Users Table */}
      <Card className="flex flex-col mt-8 bg-gray-800 text-white">
        <CardHeader>
          <CardTitle>Existing Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700 pb-2 mb-2">
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Companies</div>
            <div>Actions</div>
          </div>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center border border-gray-700 p-2 rounded-md">
                <div className="font-medium text-white">{user.name || 'N/A'}</div>
                <div className="text-gray-300">{user.email}</div>
                <div className="text-gray-300">{user.role}</div>
                <div className="text-gray-300 text-xs">
                  {user.companies.map(cu => cu.company.name).join(', ') || 'No companies assigned'}
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleEditUser(user)} className="text-indigo-400 hover:text-indigo-300 mr-2">
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}