import { useState, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { motion, AnimatePresence } from "framer-motion"

interface CustomerNotesProps {
  customerId: string
  initialNotes: string[]
}

export const CustomerNotes = memo(({ customerId, initialNotes }: CustomerNotesProps) => {
  const [newNote, setNewNote] = useState("")
  const [customerNotes, setCustomerNotes] = useState<string[]>(initialNotes)
  const { toast } = useToast()

  const addNote = useCallback(async () => {
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
  }, [newNote, customerNotes, customerId, toast])

  const deleteNote = useCallback(async (index: number) => {
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
  }, [customerNotes, customerId, toast])

  return (
    <div className="pt-4 border-t">
      <h3 className="font-medium mb-2">Notes</h3>
      <div className="space-y-2">
        <AnimatePresence>
          {customerNotes.map((note, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start justify-between gap-2 p-2 bg-muted rounded-md"
            >
              <p className="text-sm flex-1">{note}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteNote(index)}
              >
                Delete
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
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
})

CustomerNotes.displayName = "CustomerNotes"