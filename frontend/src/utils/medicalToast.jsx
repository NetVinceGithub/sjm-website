import { toast } from 'react-toastify';

export const notifyMedicalExpirations = (employees) => {
  const dueSoon = employees.filter(emp =>
    emp.medical && isMedicalExpiringSoon(emp.medical)
  );

  const count = dueSoon.length;
  if (count > 0) {
    toast.info(
      <div style={{ fontSize: '0.9rem', color: '#fff' }}>
        ⚕️ {count} employee{count > 1 ? "s are" : " is"} due for medical check-up.
      </div>,
      {
        icon: false,
        autoClose: false,
        closeButton: false,
        hideProgressBar: true,
        draggable: false,
        style: { backgroundColor: '#444' },
      }
    );
  }
};
