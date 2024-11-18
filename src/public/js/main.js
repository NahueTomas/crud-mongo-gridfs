document.addEventListener('DOMContentLoaded', function() {
    // Manejador del formulario de subida
    const uploadForm = document.getElementById('uploadForm');
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                showAlert('success', data.message);
                // Recargar la lista de archivos
                await loadFiles();
            } else {
                showAlert('danger', data.message);
            }
        } catch (error) {
            showAlert('danger', 'Error uploading file');
        }
    });

    // Función para cargar archivos
    async function loadFiles() {
        try {
            const response = await fetch('/files');
            const files = await response.json();
            updateFilesList(files);
        } catch (error) {
            showAlert('danger', 'Error loading files');
        }
    }

    // Función para actualizar la lista de archivos en la UI
    function updateFilesList(files) {
        const tbody = document.querySelector('tbody');
        if (!files || files.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">No files uploaded yet</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = files.map(file => `
            <tr>
                <td>${file.filename}</td>
                <td>${(file.length / 1024).toFixed(2)} KB</td>
                <td>${moment(file.uploadDate).format('YYYY-MM-DD HH:mm:ss')}</td>
                <td>
                    <a href="/files/${file._id}" class="btn btn-sm btn-info" title="Download">
                        <i class="bi bi-download"></i>
                    </a>
                    <button class="btn btn-sm btn-danger delete-file" data-id="${file._id}" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Volver a agregar los event listeners para los botones de eliminar
        attachDeleteListeners();
    }

    // Función para adjuntar listeners a los botones de eliminar
    function attachDeleteListeners() {
        document.querySelectorAll('.delete-file').forEach(button => {
            button.addEventListener('click', handleDelete);
        });
    }

    // Manejador de eliminación de archivos
    async function handleDelete() {
        if (confirm('Are you sure you want to delete this file?')) {
            const fileId = this.dataset.id;
            try {
                const response = await fetch(`/files/${fileId}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                
                if (data.success) {
                    showAlert('success', 'File deleted successfully');
                    await loadFiles(); // Recargar la lista
                } else {
                    showAlert('danger', data.message || 'Error deleting file');
                }
            } catch (error) {
                showAlert('danger', 'Error deleting file');
            }
        }
    }

    // Auto-hide alerts after 3 seconds
    setTimeout(() => {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            alert.style.display = 'none';
        });
    }, 3000);
}); 