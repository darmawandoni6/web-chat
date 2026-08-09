import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { type User } from '@/types';
import { Users } from 'lucide-react';
import { useState } from 'react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onCreate: (name: string, description: string, members: string[]) => void;
}

export function CreateGroupModal({ isOpen, onClose, users, onCreate }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim(), selectedMembers);
    setName('');
    setDescription('');
    setSelectedMembers([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Users className="h-5 w-5 text-[var(--accent-violet)]" />
            Create New Group
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--muted-foreground)]">Group Name</label>
            <Input
              placeholder="e.g. 🚀 Dev Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[var(--secondary)] border-[var(--border)] text-[var(--foreground)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--muted-foreground)]">Description (optional)</label>
            <Input
              placeholder="e.g. Project coordination"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[var(--secondary)] border-[var(--border)] text-[var(--foreground)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--muted-foreground)]">Select Members</label>
            <div className="max-h-48 overflow-y-auto space-y-1 border border-[var(--border)] rounded-xl p-2 bg-[var(--secondary)]">
              {users.length === 0 ? (
                <p className="text-xs text-[var(--muted-foreground)] p-2">No other users online yet</p>
              ) : (
                users.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(u.id)}
                      onChange={() => toggleMember(u.id)}
                      className="rounded accent-[var(--accent-violet)]"
                    />
                    <span className="font-medium text-[var(--foreground)]">{u.username}</span>
                    {u.email && !u.email.includes('@guest.local') ? (
                      <span className="text-[10px] text-[var(--muted-foreground)]">({u.email})</span>
                    ) : (
                      <span className="text-[10px] font-medium text-[var(--accent-violet-hover)]">(Guest)</span>
                    )}
                  </label>

                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="border-[var(--border)] text-[var(--foreground)]">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="bg-[var(--accent-violet)] hover:bg-[var(--accent-violet-hover)] text-white"
          >
            Create Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
