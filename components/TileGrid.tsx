import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import NoteTile from './NoteTile';
import { Note } from '../lib/supabase';

interface TileGridProps {
  notes: Note[];
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  onNoteEdit: (note: Note) => void;
}

export default function TileGrid({ notes, onUpdateNote, onDeleteNote, onNoteEdit }: TileGridProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragEnd = (result: any) => {
    setDraggedItem(null);
    
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    // Update positions based on drag result
    const draggedNote = notes[sourceIndex];
    const targetNote = notes[destinationIndex];
    
    if (draggedNote && targetNote) {
      onUpdateNote(draggedNote.id, { 
        position_x: targetNote.position_x || 0,
        position_y: targetNote.position_y || 0
      });
      onUpdateNote(targetNote.id, { 
        position_x: draggedNote.position_x || 0,
        position_y: draggedNote.position_y || 0
      });
    }
  };

  const handleDragStart = (result: any) => {
    setDraggedItem(result.draggableId);
  };

  // Separate pinned and unpinned notes
  const pinnedNotes = notes.filter(note => note.pinned);
  const unpinnedNotes = notes.filter(note => !note.pinned);

  const renderNotesSection = (sectionNotes: Note[], title: string, isPinned: boolean = false) => {
    if (sectionNotes.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        {isPinned && (
          <div className="flex items-center mb-4">
            <div className="text-yellow-500 mr-2">📌</div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-yellow-400 to-transparent ml-4"></div>
          </div>
        )}
        
        <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <Droppable droppableId={`notes-${isPinned ? 'pinned' : 'unpinned'}`} direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-300 ${
                  snapshot.isDraggingOver ? 'bg-white bg-opacity-5 rounded-2xl p-4' : ''
                }`}
              >
                <AnimatePresence>
                  {sectionNotes.map((note, index) => (
                    <Draggable key={note.id} draggableId={note.id} index={index}>
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className={`transform transition-all duration-200 ${
                            snapshot.isDragging ? 'rotate-3 scale-105 shadow-2xl z-50' : ''
                          }`}
                          whileHover={{ y: -5 }}
                        >
                          <NoteTile
                            note={note}
                            onUpdate={(updates) => onUpdateNote(note.id, updates)}
                            onDelete={() => onDeleteNote(note.id)}
                            onEdit={() => onNoteEdit(note)}
                            isDragging={snapshot.isDragging}
                          />
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </motion.div>
    );
  };

  if (notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 glass-card rounded-2xl"
      >
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-white mb-2">No notes yet</h3>
        <p className="text-gray-300">Click the floating "+" button to create your first note!</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      {renderNotesSection(pinnedNotes, 'Pinned Notes', true)}
      {renderNotesSection(unpinnedNotes, 'Notes')}
    </div>
  );
}
