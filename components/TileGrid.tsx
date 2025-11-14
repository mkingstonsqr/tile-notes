import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import NoteTile from './NoteTile'

interface Note {
  id: string
  title: string
  content: string
  color: string
  position: { x: number; y: number }
}

interface TileGridProps {
  notes: Note[]
  onUpdateNote: (id: string, updates: Partial<Note>) => void
  onDeleteNote: (id: string) => void
}

export default function TileGrid({ notes, onUpdateNote, onDeleteNote }: TileGridProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const handleDragEnd = (result: any) => {
    setDraggedItem(null)
    
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) return

    // Update positions based on drag result
    const draggedNote = notes[sourceIndex]
    const targetNote = notes[destinationIndex]
    
    if (draggedNote && targetNote) {
      onUpdateNote(draggedNote.id, { position: targetNote.position })
      onUpdateNote(targetNote.id, { position: draggedNote.position })
    }
  }

  const handleDragStart = (result: any) => {
    setDraggedItem(result.draggableId)
  }

  return (
    <div className="w-full">
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <Droppable droppableId="notes-grid" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-colors ${
                snapshot.isDraggingOver ? 'bg-blue-50' : ''
              }`}
            >
              {notes.map((note, index) => (
                <Draggable key={note.id} draggableId={note.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transform transition-transform ${
                        snapshot.isDragging ? 'rotate-3 scale-105 shadow-2xl' : ''
                      } ${draggedItem === note.id ? 'z-50' : ''}`}
                    >
                      <NoteTile
                        note={note}
                        onUpdate={(updates) => onUpdateNote(note.id, updates)}
                        onDelete={() => onDeleteNote(note.id)}
                        isDragging={snapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {notes.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No notes yet</h3>
          <p className="text-gray-500">Click the "New Note" button to get started!</p>
        </div>
      )}
    </div>
  )
}
