
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AcademicSession } from '@/hooks/useSchoolSettings';

interface SessionSwitcherProps {
  sessions: AcademicSession[];
  currentSession: AcademicSession | null;
  onSwitchSession: (sessionId: string) => void;
  onCreateSession?: (sessionName: string) => void;
}

export const SessionSwitcher: React.FC<SessionSwitcherProps> = ({
  sessions,
  currentSession,
  onSwitchSession,
  onCreateSession
}) => {
  const [open, setOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(currentSession?.id || '');
  const [newSessionName, setNewSessionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSwitch = () => {
    if (selectedSessionId && selectedSessionId !== currentSession?.id) {
      onSwitchSession(selectedSessionId);
      setOpen(false);
    }
  };

  const handleCreateSession = () => {
    if (newSessionName.trim() && onCreateSession) {
      onCreateSession(newSessionName.trim());
      setNewSessionName('');
      setIsCreating(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-pink-500 text-pink-500 hover:bg-pink-50"
        >
          🔄 SWITCH SESSION
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Switch Academic Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Current Session: {currentSession?.session_name}</Label>
          </div>
          
          {!isCreating ? (
            <>
              <div className="space-y-2">
                <Label>Select Session</Label>
                <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.session_name} {session.is_current ? '(Current)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleSwitch}
                  disabled={!selectedSessionId || selectedSessionId === currentSession?.id}
                  className="flex-1"
                >
                  Switch Session
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsCreating(true)}
                  className="flex-1"
                >
                  Create New
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>New Session Name</Label>
                <Input
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="e.g., 2024/2025"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateSession}
                  disabled={!newSessionName.trim()}
                  className="flex-1"
                >
                  Create Session
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
