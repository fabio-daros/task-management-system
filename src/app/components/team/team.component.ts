import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TeamService, Team } from '../../team.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent {
  newTeamMember: Team = { id: '', name: '' };
  successMessage: string | null = null;
  errorMessage: string | null = null;
  showLocateModal = false;
  isMemberSelected = false;
  teamMembers: Team[] = [];
  selectedTeamMemberId: string | null = null;

  constructor(private teamService: TeamService) {}

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    if (this.newTeamMember.id) {
      this.teamService.updateTeam(this.newTeamMember).subscribe(
        () => {
          this.showSuccessMessage('Member updated successfully!');
          this.newTeamMember = { id: '', name: '' };
        },
        (error) => {
          this.showErrorMessage('Failed to update member.');
          console.error('Error updating member:', error);
        }
      );
    } else {
      this.newTeamMember.id = this.generateUniqueId();
      this.teamService.addTeam(this.newTeamMember).subscribe(
        () => {
          this.showSuccessMessage('Member added successfully!');
          this.newTeamMember = { id: '', name: '' };
        },
        (error) => {
          this.showErrorMessage('Failed to add member.');
          console.error('Error adding member:', error);
        }
      );
    }
  }

  openLocateModal() {
    this.showLocateModal = true;
    this.teamService.getTeams().subscribe(
      (members) => {
        this.teamMembers = members;
      },
      (error) => {
        this.showErrorMessage('Failed to load members.');
        console.error('Error loading members:', error);
      }
    );
  }

  closeLocateModal() {
    this.showLocateModal = false;
  }

  selectTeamMember() {
    if (this.selectedTeamMemberId) {
      const selectedMember = this.teamMembers.find(
        (member) => member.id === this.selectedTeamMemberId
      );
      if (selectedMember) {
        this.newTeamMember = { ...selectedMember };
        this.isMemberSelected = true;
      }
    }
    this.closeLocateModal();
  }

  deleteTeamMember() {
    if (this.selectedTeamMemberId) {
      this.teamService.deleteTeam(this.selectedTeamMemberId).subscribe(
        () => {
          this.showSuccessMessage('Member deleted successfully!');
          this.newTeamMember = { id: '', name: '' };
          this.isMemberSelected = false;
        },
        (error) => {
          this.showErrorMessage('Failed to delete member.');
          console.error('Error deleting member:', error);
        }
      );
    }
  }

  private generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 5);
  }

  private showSuccessMessage(message: string) {
    this.successMessage = message;
    this.errorMessage = null;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  private showErrorMessage(message: string) {
    this.errorMessage = message;
    this.successMessage = null;
    setTimeout(() => {
      this.errorMessage = null;
    }, 3000); 
  }
}
