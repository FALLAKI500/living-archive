import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface CustomerNotesProps {
  customerId: string
  initialNotes: string[]
}

export function CustomerNotes({ customerId, initialNotes }: CustomerNotesProps) {
  const [newNote, setNewNote] = useState("")
  const [customerNotes, setCustomerNotes] = useState<string[]>(initialNotes)
  const { toast } = useToast()

  const addNote = async () => {
    if (!newNote.trim()) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          notes: [...customerNotes, newNote],
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)

      if (error) throw error

      setCustomerNotes(prev => [...prev, newNote])
      setNewNote("")
      toast({
        title: "Note added successfully",
        description: "Your note has been saved.",
      })
    } catch (error) {
      toast({
        title: "Error adding note",
        description: "There was a problem saving your note.",
        variant: "destructive",
      })
    }
  }

  const deleteNote = async (index: number) => {
    try {
      const newNotes = customerNotes.filter((_, i) => i !== index)
      const { error } = await supabase
        .from('profiles')
        .update({ 
          notes: newNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)

      if (error) throw error

      setCustomerNotes(newNotes)
      toast({
        title: "Note deleted successfully",
        description: "Your note has been removed.",
      })
    } catch (error) {
      toast({
        title: "Error deleting note",
        description: "There was a problem removing your note.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="pt-4 border-t">
      <h3 className="font-medium mb-2">Notes</h3>
      <div className="space-y-2">
        {customerNotes.map((note, index) => (
          <div key={index} className="flex items-start justify-between gap-2 p-2 bg-muted rounded-md">
            <p className="text-sm flex-1">{note}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteNote(index)}
            >
              Delete
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            placeholder="Add a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addNote()}
          />
          <Button onClick={addNote}>Add</Button>
        </div>
      </div>
    </div>
  )
}