import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // ✅ Importa CommonModule

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Asegura que `CommonModule` está importado
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  name: string = '';
  phone: string = '';
  message: string = '';
  isLoading: boolean = false;
  showSuccessMessage: boolean = false;

  // Validar que el nombre solo contenga letras y espacios
  validateName(event: KeyboardEvent): void {
    const regex = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/;
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }

  // Validar que el teléfono solo contenga números y no más de 10 caracteres
  validatePhone(event: KeyboardEvent): void {
    const regex = /^[0-9]+$/;
    if (!regex.test(event.key) || this.phone.length >= 10) {
      event.preventDefault();
    }
  }

  // Validar que el mensaje tenga al menos 10 caracteres
  isMessageValid(): boolean {
    return this.message.length >= 10;
  }

  // Simulación de envío del formulario
  onSubmit(event: Event): void {
    event.preventDefault();

    // Verificar que los campos sean válidos antes de enviar
    if (this.name && this.phone.length === 10 && this.isMessageValid()) {
      this.isLoading = true; // Mostrar animación de carga

      setTimeout(() => {
        this.isLoading = false;
        this.showSuccessMessage = true; // Mostrar mensaje de éxito

        // Limpiar formulario después de 3 segundos
        setTimeout(() => {
          this.showSuccessMessage = false;
          this.name = '';
          this.phone = '';
          this.message = '';
        }, 3000);
      }, 2000);
    }
  }
}
