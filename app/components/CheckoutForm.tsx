import { useState } from "react";
import { useNotification } from "./Notification";

interface CheckoutFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  totalAmount: number;
}

export default function CheckoutForm({ onSubmit, onCancel, totalAmount }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });

  const { showNotification } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || 
        !formData.city || !formData.state || !formData.country || !formData.zipCode) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification("Please enter a valid email address", "error");
      return;
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      showNotification("Please enter a valid phone number", "error");
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>
        <div className="text-xl font-semibold mb-6">
          Total Amount: ${totalAmount.toFixed(2)}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="+1234567890"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Address</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="123 Main St"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">City</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="New York"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">State</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="NY"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Country</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="United States"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">ZIP Code</span>
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="10001"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Proceed to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 