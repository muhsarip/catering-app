-- Seed Data for Catering Order Management System
-- Run this after schema.sql

-- Insert demo admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@catering.com', '$2a$10$i9sK24rnmXGb3FSH4zpAAuQlmgk61b6h3EMDFPFCbqahglYguoMIi', 'Admin User', 'admin');

-- Insert catering services
INSERT INTO catering_services (name, description, is_active) VALUES
('Premium Corporate Catering', 'High-end catering service for corporate events', true),
('Family Style Catering', 'Comfort food for family gatherings', true),
('Wedding & Events Catering', 'Elegant catering for special occasions', true);

-- Get catering service IDs for menu items
DO $$
DECLARE
    premium_id UUID;
    family_id UUID;
    wedding_id UUID;
BEGIN
    SELECT id INTO premium_id FROM catering_services WHERE name = 'Premium Corporate Catering';
    SELECT id INTO family_id FROM catering_services WHERE name = 'Family Style Catering';
    SELECT id INTO wedding_id FROM catering_services WHERE name = 'Wedding & Events Catering';

    -- Insert menu items for Premium Corporate Catering
    INSERT INTO menu_items (catering_service_id, name, description, price, category, is_available) VALUES
    (premium_id, 'Executive Lunch Box', 'Premium lunch box with grilled salmon, vegetables, and rice', 25.00, 'Main Course', true),
    (premium_id, 'Business Breakfast Platter', 'Continental breakfast with pastries, fruits, and beverages', 18.00, 'Breakfast', true),
    (premium_id, 'Gourmet Sandwich Platter', 'Assorted gourmet sandwiches with sides', 22.00, 'Lunch', true),
    (premium_id, 'Premium Coffee & Tea Service', 'Full beverage service with premium coffee and teas', 8.00, 'Beverages', true);

    -- Insert menu items for Family Style Catering
    INSERT INTO menu_items (catering_service_id, name, description, price, category, is_available) VALUES
    (family_id, 'Homestyle Fried Chicken', 'Crispy fried chicken with mashed potatoes and gravy', 15.00, 'Main Course', true),
    (family_id, 'Pasta Family Feast', 'Large serving of pasta with meat sauce and garlic bread', 18.00, 'Main Course', true),
    (family_id, 'BBQ Ribs Platter', 'Tender BBQ ribs with coleslaw and cornbread', 20.00, 'Main Course', true),
    (family_id, 'Garden Fresh Salad', 'Large mixed green salad with dressing', 10.00, 'Sides', true);

    -- Insert menu items for Wedding & Events Catering
    INSERT INTO menu_items (catering_service_id, name, description, price, category, is_available) VALUES
    (wedding_id, 'Filet Mignon Dinner', 'Tender filet mignon with seasonal vegetables', 45.00, 'Main Course', true),
    (wedding_id, 'Grilled Salmon Entrée', 'Atlantic salmon with lemon butter sauce', 38.00, 'Main Course', true),
    (wedding_id, 'Vegetarian Wellington', 'Elegant vegetarian main course option', 32.00, 'Main Course', true),
    (wedding_id, 'Wedding Cake (per slice)', 'Custom wedding cake slice', 12.00, 'Dessert', true),
    (wedding_id, 'Champagne Service', 'Premium champagne service per person', 15.00, 'Beverages', true);
END $$;

-- Success message
SELECT 'Seed data inserted successfully!' as message;
SELECT 'Admin login: admin@catering.com / admin123' as credentials;
