from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

staff_data = [
    ('Dr. Ramesh Sharma', 'Doctor', '9876543210', 'ramesh@hospital.com', '1980-05-15', 'M', 'Delhi', '2015-06-01'),
    ('Dr. Anita Desai', 'Doctor', '9876543211', 'anita@hospital.com', '1985-08-22', 'F', 'Mumbai', '2018-09-15'),
    ('Nurse Sunita', 'Nurse', '9876543212', 'sunita@hospital.com', '1990-11-10', 'F', 'Pune', '2020-01-10'),
    ('Ravi Kumar', 'Receptionist', '9876543213', 'ravi@hospital.com', '1995-02-28', 'M', 'Delhi', '2022-03-01'),
    ('Dr. Meena', 'Dietician', '9876543214', 'meena@hospital.com', '1988-07-07', 'F', 'Delhi', '2021-05-12'),
    ('Anil Verma', 'Pharmacist', '9876543215', 'anil@hospital.com', '1992-04-18', 'M', 'Delhi', '2021-08-20')
]

password = "Illuma@2026"
hashed = pwd_context.hash(password)

print(f"-- Use password: {password} for all accounts")
print("INSERT INTO Staff (Name, Role, Contact, Email, password_hash, DOB, Gender, Address, Join_Date) VALUES")
lines = []
for s in staff_data:
    line = f"('{s[0]}', '{s[1]}', '{s[2]}', '{s[3]}', '{hashed}', '{s[4]}', '{s[5]}', '{s[6]}', '{s[7]}')"
    lines.append(line)
print(",\n".join(lines) + ";")
