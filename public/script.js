document.addEventListener('DOMContentLoaded', () => {
    const organizationForm = document.getElementById('organization-form');
    if (organizationForm) {
        organizationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            fetch('/register-organization', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Organization registered successfully!');
                    window.location.href = '/';
                } else {
                    alert('Error registering organization.');
                }
            });
        });
    }

    const teamForm = document.getElementById('team-form');
    if (teamForm) {
        teamForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            fetch('/add-team', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Team added successfully!');
                    window.location.href = '/';
                } else {
                    alert('Error adding team.');
                }
            });
        });

        // Populate the organization dropdown
        fetch('/organizations')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const organizationSelect = document.getElementById('organization-select');
                data.organizations.forEach(org => {
                    const option = document.createElement('option');
                    option.value = org.id;
                    option.textContent = org.name;
                    organizationSelect.appendChild(option);
                });
            } else {
                alert('Error fetching organizations.');
            }
        });
    }

    const memberForm = document.getElementById('member-form');
    if (memberForm) {
        memberForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            fetch('/add-member', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Member added successfully!');
                    window.location.href = '/';
                } else {
                    alert('Error adding member.');
                }
            });
        });

        // Populate the team dropdown
        fetch('/teams')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const teamSelect = document.getElementById('team-select');
                data.teams.forEach(team => {
                    const option = document.createElement('option');
                    option.value = team.id;
                    option.textContent = team.name;
                    teamSelect.appendChild(option);
                });
            } else {
                alert('Error fetching teams.');
            }
        });
    }

    loadOrganizations();
    loadTeams();
    loadMembers();
});

function loadOrganizations() {
    fetch('/organizations')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const organizationList = document.getElementById('organization-list');
            if (organizationList) {
                organizationList.innerHTML = '';
                data.organizations.forEach(org => {
                    const orgDiv = document.createElement('div');
                    const orgName = org.name || 'N/A';
                    const orgEmail = org.email || 'N/A';
                    const orgLocation = org.location || 'N/A';
                    orgDiv.innerHTML = `<strong>${orgName}</strong> (${orgEmail}, ${orgLocation})`;
                    const teamList = document.createElement('ul');
                    data.teams.filter(team => team.organization_id === org.id).forEach(team => {
                        const teamItem = document.createElement('li');
                        teamItem.textContent = team.name || 'N/A';
                        teamList.appendChild(teamItem);
                    });
                    orgDiv.appendChild(teamList);
                    organizationList.appendChild(orgDiv);
                });
            }
        } else {
            alert('Error fetching organizations.');
        }
    });
}

function loadTeams() {
    fetch('/teams')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const teamList = document.getElementById('team-list');
            if (teamList) {
                teamList.innerHTML = '';
                data.teams.forEach(team => {
                    const teamDiv = document.createElement('div');
                    const teamName = team.name || 'N/A';
                    teamDiv.textContent = `Team ID: ${team.id}, Team Name: ${teamName}, Organization ID: ${team.organization_id}`;
                    teamList.appendChild(teamDiv);
                });
            }
        } else {
            alert('Error fetching teams.');
        }
    });
}

function loadMembers() {
    fetch('/members')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const memberList = document.getElementById('member-list');
            if (memberList) {
                memberList.innerHTML = '';
                data.members.forEach(member => {
                    const memberDiv = document.createElement('div');
                    const memberName = member.name || 'N/A';
                    memberDiv.textContent = `${memberName} (Team ID: ${member.team_id})`;
                    const status = document.createElement('span');
                    status.textContent = member.image ? 'Image Uploaded' : 'Image Not Uploaded';
                    status.style.color = member.image ? 'green' : 'red';
                    status.className = 'status';
                    memberDiv.appendChild(status);
                    if (member.image) {
                        const img = document.createElement('img');
                        img.src = `/uploads/${member.image}`;
                        img.width = 50;
                        memberDiv.appendChild(img);
                    }
                    memberList.appendChild(memberDiv);
                });
            }
        } else {
            alert('Error fetching members.');
        }
    });
}