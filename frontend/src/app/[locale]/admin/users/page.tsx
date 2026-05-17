"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { apiClient } from "@/lib/api";
import { User } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Shield,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  MailCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminGridCard } from "@/components/admin/AdminGridCard";
import { AdminModal } from "@/components/admin/AdminModal";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const locale = useLocale();
  const confirm = useConfirm();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm(
      "Supprimer l'utilisateur",
      "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
    );
    if (!isConfirmed) return;

    try {
      await apiClient.deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      toast.success("Utilisateur supprimé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'utilisateur");
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        isActive: user.isActive,
        password: "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "USER",
        isActive: true,
        password: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingUser) {
        // Create clean object for update
        const updateData: any = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          isActive: formData.isActive,
        };

        // Add password ONLY if user entered one
        if (formData.password.trim() !== "") {
          updateData.password = formData.password;
        }

        await apiClient.updateUser(editingUser.id, updateData);

        toast.success("Utilisateur mis à jour");
      } else {
        console.log("Creating user with data:", formData);
        await apiClient.createUser(formData).catch(() => {
          throw new Error("Failed to create user");
        });
        toast.success("Utilisateur créé");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      if (!editingUser) {
        toast.info("Création échouée.");
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const inputClass =
    "w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-xl text-black placeholder-gray-600 focus:outline-none focus:border-gold/50 transition-all text-sm";

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Users"
        subtitle="Manage customer and admin accounts"
        actionLabel="Add User"
        onAction={() => openModal()}
      />

      <AdminSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search users by name or email..."
        totalCount={users.length}
        icon={<UserIcon className="w-5 h-5 text-gold" />}
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-white/5 animate-pulse rounded-3xl"
            />
          ))
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No users found matching your search.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <AdminGridCard
              key={user.id}
              id={user.id}
              onEdit={() => openModal(user)}
              onDelete={() => handleDelete(user.id)}
              glowClass={
                user.role === "ADMIN"
                  ? "bg-gold/10 group-hover:bg-gold/20"
                  : "bg-blue-500/5 group-hover:bg-blue-500/10"
              }
              icon={
                user.role === "ADMIN" ? (
                  <Shield className="w-6 h-6" />
                ) : (
                  <UserIcon className="w-6 h-6" />
                )
              }
            >
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-serif font-bold text-white line-clamp-1">
                  {user.firstName} {user.lastName}
                </h3>
                {user.role === "ADMIN" && (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-gold bg-gold/10 border border-gold/20 px-2 py-1 rounded">
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-6 text-sm text-gray-400">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="truncate">{user.email}</span>
                </p>
                {user.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    {user.phone}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
                    Status
                  </span>
                  <span
                    className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1 ${
                      user.isActive ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {user.isActive ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {user.isActive ? "Active" : "Suspended"}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
                    Joined
                  </span>
                  <span className="text-white text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </AdminGridCard>
          ))
        )}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingUser ? "Edit User" : "Create User"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className={inputClass}
                placeholder="John"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className={inputClass}
                placeholder="Doe"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                <MailCheck className="w-3 h-3 text-gold" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={inputClass}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="+1 234 567 890"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required ={!editingUser}
                className={inputClass}
                placeholder={editingUser ? "Laisser vide pour ne pas modifier" : "Mot de passe"}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`${inputClass} appearance-none`}
              >
                <option value="USER">Customer (USER)</option>
                <option value="ADMIN">Administrator (ADMIN)</option>
              </select>
            </div>

            <div className="md:col-span-2 border-t border-white/5 pt-6 mt-2">
              <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-gold bg-dark-bg border-white/20 rounded"
                />
                <div>
                  <span className="block text-sm font-bold text-white">
                    Active Account
                  </span>
                  <span className="text-xs text-gray-500">
                    Uncheck to suspend this user's access
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-white/5 mt-8">
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              variant="outline"
              className="flex-1 py-6 rounded-xl border-white/10 text-white"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-6 rounded-xl bg-gold hover:bg-gold/90 text-dark-bg font-bold"
            >
              {isSubmitting
                ? "Saving..."
                : editingUser
                  ? "Save Changes"
                  : "Create User"}
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
