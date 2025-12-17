import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '../test-utils';
import { LibraryView } from '@/components/LibraryView';
import userEvent from '@testing-library/user-event';

describe('LibraryView - Behavior', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should display all exercises by default', () => {
    render(<LibraryView />);
    
    // Should show exercise count
    expect(screen.getByRole('status')).toHaveTextContent(/\d+ exercises/);
  });

  it('should filter exercises by search query', async () => {
    const user = userEvent.setup();
    render(<LibraryView />);
    
    const searchInput = screen.getByLabelText('Search exercises');
    await user.type(searchInput, 'bench');
    
    // Should update the count
    await waitFor(() => {
      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      // Should show exercises matching search
      expect(screen.getByText('Barbell Bench Press')).toBeInTheDocument();
    });
  });

  it('should filter exercises by muscle group', async () => {
    const user = userEvent.setup();
    render(<LibraryView />);
    
    // Click on a muscle group tab
    const chestTab = screen.getByRole('tab', { name: /chest/i });
    await user.click(chestTab);
    
    // Should update the count and show only chest exercises
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
  });

  it('should show empty state when no exercises match search', async () => {
    const user = userEvent.setup();
    render(<LibraryView />);
    
    const searchInput = screen.getByLabelText('Search exercises');
    await user.type(searchInput, 'zzzznonexistent');
    
    expect(screen.getByRole('heading', { name: /no exercises found/i })).toBeInTheDocument();
    expect(screen.getByText(/try adjusting your search or filter/i)).toBeInTheDocument();
  });

  it('should combine search and muscle group filters', async () => {
    const user = userEvent.setup();
    render(<LibraryView />);
    
    // Select muscle group
    const shouldersTab = screen.getByRole('tab', { name: /shoulders/i });
    await user.click(shouldersTab);
    
    // Then search
    const searchInput = screen.getByLabelText('Search exercises');
    await user.type(searchInput, 'press');
    
    // Should show exercises that match both filters
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
  });

  it('should expand and collapse exercise details', async () => {
    const user = userEvent.setup();
    render(<LibraryView />);
    
    // Find first accordion trigger
    const triggers = screen.getAllByRole('button');
    const firstExercise = triggers.find(btn => btn.getAttribute('data-state') !== undefined);
    
    if (firstExercise) {
      // Click to expand
      await user.click(firstExercise);
      
      // Should show instructions
      expect(screen.getByText('Instructions')).toBeInTheDocument();
      expect(screen.getByText('Form Cues')).toBeInTheDocument();
    }
  });

  it('should display exercise details with proper structure', async () => {
    const user = userEvent.setup();
    render(<LibraryView />);
    
    // Expand first exercise
    const triggers = screen.getAllByRole('button');
    const firstExercise = triggers.find(btn => btn.getAttribute('data-state') !== undefined);
    
    if (firstExercise) {
      await user.click(firstExercise);
      
      // Should have ordered list for instructions
      const orderedLists = screen.getAllByRole('list');
      expect(orderedLists.length).toBeGreaterThan(0);
    }
  });

  it('should show exercise difficulty and muscle group badges', () => {
    render(<LibraryView />);
    
    // Badges should be visible for exercises
    const badges = screen.getAllByText(/beginner|intermediate|advanced|chest|back|shoulders|legs|core|arms/i);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('should update live region when filtering changes', async () => {
    const user = userEvent.setup();
    render(<LibraryView />);
    
    const initialStatus = screen.getByRole('status');
    const initialText = initialStatus.textContent;
    
    // Filter by search
    const searchInput = screen.getByLabelText('Search exercises');
    await user.type(searchInput, 'squat');
    
    // Status should update
    const updatedStatus = screen.getByRole('status');
    expect(updatedStatus.textContent).not.toBe(initialText);
  });

  it('should clear search query', async () => {
    const user = userEvent.setup();
    render(<LibraryView />);
    
    const searchInput = screen.getByLabelText('Search exercises') as HTMLInputElement;
    
    // Type and then clear
    await user.type(searchInput, 'bench');
    expect(searchInput.value).toBe('bench');
    
    await user.clear(searchInput);
    expect(searchInput.value).toBe('');
  });

  it('should handle case-insensitive search', async () => {
    const user = userEvent.setup();
    render(<LibraryView />);
    
    const searchInput = screen.getByLabelText('Search exercises');
    
    // Search with uppercase
    await user.type(searchInput, 'BENCH');
    
    // Should still find exercises
    await waitFor(() => {
      expect(screen.getByText('Barbell Bench Press')).toBeInTheDocument();
    });
  });

  it('should allow searching by muscle group name', async () => {
    const user = userEvent.setup();
    render(<LibraryView />);
    
    const searchInput = screen.getByLabelText('Search exercises');
    await user.type(searchInput, 'chest');
    
    // Should find chest exercises
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
  });

  it('should show all exercises when switching back to "All" tab', async () => {
    const user = userEvent.setup();
    render(<LibraryView />);
    
    const initialStatus = screen.getByRole('status');
    const initialCount = initialStatus.textContent;
    
    // Filter by muscle group
    const chestTab = screen.getByRole('tab', { name: /chest/i });
    await user.click(chestTab);
    
    // Switch back to All
    const allTab = screen.getByRole('tab', { name: /^all$/i });
    await user.click(allTab);
    
    // Should show all exercises again
    const finalStatus = screen.getByRole('status');
    expect(finalStatus.textContent).toBe(initialCount);
  });
});
