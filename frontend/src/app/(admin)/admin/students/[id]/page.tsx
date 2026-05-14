"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { studentsApi, usersApi } from "@/lib/api";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Edit, Phone, Calendar, FileText, Activity, UserPlus, Upload, Download, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import toast from "react-hot-toast";

interface Student {
  id: number;
  name: string;
  student_id: string;
  date_of_birth: string;
  age: number;
  autism_level: string;
  diagnosis: string;
  is_active: boolean;
  enrollment_date: string;
  medical_notes: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  blood_group: string;
  allergies: string;
  parents: Array<{
    id: number;
    parent_name: string;
    parent_email: string;
    parent_phone: string;
    relationship: string;
    is_primary: boolean;
  }>;
}

interface Document {
  id: number;
  title: string;
  document_type: string;
  notes: string;
  uploaded_by_name: string;
  created_at: string;
  file: string;
}

interface FoundUser {
  id: number;
  full_name?: string;
  name?: string;
  email: string;
}

export default function StudentDetailPage() {
  const params = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  // Documents state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: "", document_type: "other", notes: "" });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Link Parent dialog state
  const [linkOpen, setLinkOpen] = useState(false);
  const [parentEmail, setParentEmail] = useState("");
  const [relationship, setRelationship] = useState("father");
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [userSearching, setUserSearching] = useState(false);
  const [linking, setLinking] = useState(false);

  const studentId = Number(params.id);

  const fetchDocuments = () => {
    studentsApi.getDocuments(studentId)
      .then((res) => setDocuments(res.data.results || res.data))
      .catch(() => {});
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) { toast.error("Please select a file"); return; }
    if (!uploadForm.title.trim()) { toast.error("Please enter a title"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", uploadFile);
      fd.append("title", uploadForm.title);
      fd.append("document_type", uploadForm.document_type);
      fd.append("notes", uploadForm.notes);
      await studentsApi.uploadDocument(studentId, fd);
      toast.success("Document uploaded");
      setUploadOpen(false);
      setUploadForm({ title: "", document_type: "other", notes: "" });
      setUploadFile(null);
      fetchDocuments();
    } catch {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const fetchStudent = () => {
    studentsApi.get(studentId)
      .then((res) => setStudent(res.data))
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  };

  const fetchParents = () => {
    api.get(`/students/${studentId}/parents/`)
      .then((res) => {
        setStudent((prev) => prev ? { ...prev, parents: res.data } : prev);
      })
      .catch(() => {
        // silently keep existing parent data
      });
  };

  useEffect(() => {
    fetchStudent();
    fetchDocuments();
  }, [params.id]);

  useEffect(() => {
    if (student) {
      fetchParents();
    }
  }, [student?.id]);

  const handleEmailBlur = async () => {
    if (!parentEmail) return;
    setUserSearching(true);
    setFoundUser(null);
    try {
      const res = await usersApi.getAll({ search: parentEmail });
      const results: FoundUser[] = res.data?.results ?? res.data;
      const match = results.find(
        (u: FoundUser) => u.email?.toLowerCase() === parentEmail.toLowerCase()
      );
      if (match) {
        setFoundUser(match);
      } else {
        toast.error("No user found with that email.");
      }
    } catch {
      toast.error("Failed to search for user.");
    } finally {
      setUserSearching(false);
    }
  };

  const handleLinkParent = async () => {
    if (!foundUser) return;
    setLinking(true);
    try {
      await api.post(`/students/${studentId}/parents/`, {
        parent: foundUser.id,
        relationship,
      });
      toast.success("Parent linked successfully.");
      setLinkOpen(false);
      setParentEmail("");
      setFoundUser(null);
      setRelationship("father");
      fetchParents();
    } catch {
      toast.error("Failed to link parent. They may already be linked.");
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-neutral-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!student) return <div>Student not found</div>;

  const levelColors: Record<string, string> = {
    Level1: "bg-neutral-100 text-neutral-800",
    Level2: "bg-yellow-100 text-yellow-800",
    Level3: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/students">
        <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Button>
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center text-3xl font-bold text-neutral-800">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                <Badge variant={student.is_active ? "success" : "secondary"}>
                  {student.is_active ? "Active" : "Inactive"}
                </Badge>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelColors[student.autism_level]}`}>
                  {student.autism_level}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="font-mono text-neutral-800 font-semibold">{student.student_id}</span>
                <span>•</span>
                <span>{student.age} years old</span>
                <span>•</span>
                <span>DOB: {formatDate(student.date_of_birth)}</span>
                <span>•</span>
                <span>Blood Group: {student.blood_group || "Not specified"}</span>
              </div>
            </div>
          </div>
          <Button size="sm" className="gap-2 bg-black hover:bg-neutral-800 text-white">
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="parents">Parents</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-neutral-800" />
                Diagnosis
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{student.diagnosis || "No diagnosis information available"}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-700" />
                Enrollment Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Enrolled Date</span>
                  <span className="font-medium">{formatDate(student.enrollment_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Autism Level</span>
                  <span className="font-medium">{student.autism_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium">{student.is_active ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-red-50 rounded-xl border border-red-100 p-5">
            <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Emergency Contact
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-red-500 text-xs uppercase tracking-wider mb-1">Name</p>
                <p className="font-semibold text-gray-800">{student.emergency_contact_name || "Not set"}</p>
              </div>
              <div>
                <p className="text-red-500 text-xs uppercase tracking-wider mb-1">Phone</p>
                <p className="font-semibold text-gray-800">{student.emergency_contact_phone || "Not set"}</p>
              </div>
              <div>
                <p className="text-red-500 text-xs uppercase tracking-wider mb-1">Relation</p>
                <p className="font-semibold text-gray-800 capitalize">{student.emergency_contact_relation || "Not set"}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="mt-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Medical Notes</h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-4">
                {student.medical_notes || "No medical notes available"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Allergies</h3>
              <p className="text-sm text-gray-600 bg-yellow-50 rounded-lg p-4">
                {student.allergies || "No known allergies"}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="parents" className="mt-4">
          <div className="space-y-3">
            {/* Header row with Link Parent button */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Linked Parents</h3>
              <Button
                size="sm"
                className="gap-2 bg-black hover:bg-neutral-800 text-white"
                onClick={() => setLinkOpen(true)}
              >
                <UserPlus className="w-4 h-4" />
                Link Parent
              </Button>
            </div>

            {student.parents.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <p className="text-gray-400 text-sm text-center">No parents linked yet</p>
              </div>
            )}

            {student.parents.map((parent) => (
              <div key={parent.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-700 font-bold text-lg">
                    {parent.parent_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{parent.parent_name}</p>
                    <p className="text-sm text-gray-500 capitalize">{parent.relationship}</p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-600">{parent.parent_email}</p>
                  <p className="text-gray-500">{parent.parent_phone}</p>
                </div>
                {parent.is_primary && (
                  <Badge variant="purple" className="ml-4">Primary</Badge>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-gray-400 text-sm text-center py-8">Session reports will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Documents</h3>
              <Button size="sm" className="gap-2 bg-black hover:bg-neutral-800 text-white" onClick={() => setUploadOpen(true)}>
                <Upload className="w-4 h-4" />
                Upload Document
              </Button>
            </div>
            {documents.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No documents uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                        <p className="text-xs text-gray-400 capitalize">{doc.document_type.replace("_", " ")} · {formatDate(doc.created_at)}</p>
                      </div>
                    </div>
                    <a href={doc.file} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Upload Document Dialog */}
      <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) { setUploadFile(null); setUploadForm({ title: "", document_type: "other", notes: "" }); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="doc-title">Title *</Label>
              <Input id="doc-title" value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} placeholder="e.g. Medical Assessment Report" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-type">Document Type</Label>
              <select id="doc-type" value={uploadForm.document_type} onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="medical">Medical Report</option>
                <option value="assessment">Assessment Report</option>
                <option value="consent">Consent Form</option>
                <option value="birth_cert">Birth Certificate</option>
                <option value="photo_id">Photo ID</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-file">File *</Label>
              <input id="doc-file" type="file" required onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium cursor-pointer" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-notes">Notes (optional)</Label>
              <Input id="doc-notes" value={uploadForm.notes} onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })} placeholder="Any additional notes" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={uploading} className="bg-black text-white hover:bg-neutral-800">
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Link Parent Dialog */}
      <Dialog open={linkOpen} onOpenChange={(open) => {
        setLinkOpen(open);
        if (!open) {
          setParentEmail("");
          setFoundUser(null);
          setRelationship("father");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link Parent to Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Parent Email
              </label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => {
                  setParentEmail(e.target.value);
                  setFoundUser(null);
                }}
                onBlur={handleEmailBlur}
                placeholder="parent@example.com"
                className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-lg text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
              <p className="text-xs text-neutral-400 mt-1">Tab out or click away to search</p>
            </div>

            {userSearching && (
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <div className="w-4 h-4 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin" />
                Searching...
              </div>
            )}

            {foundUser && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-600 font-medium mb-0.5">User found</p>
                <p className="text-sm font-semibold text-gray-900">
                  {foundUser.full_name ?? foundUser.name ?? foundUser.email}
                </p>
                <p className="text-xs text-gray-500">{foundUser.email}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              >
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setLinkOpen(false)}
              disabled={linking}
            >
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-neutral-800"
              onClick={handleLinkParent}
              disabled={!foundUser || linking}
            >
              {linking ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-neutral-500 border-t-white rounded-full animate-spin" />
                  Linking...
                </span>
              ) : (
                "Link Parent"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
