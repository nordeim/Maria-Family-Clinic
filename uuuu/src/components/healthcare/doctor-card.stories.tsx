// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react"
import { DoctorCard } from "./doctor-card"

const meta = {
  title: "Healthcare/DoctorCard",
  component: DoctorCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DoctorCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    doctor: {
      id: "1",
      name: "Sarah Smith",
      specialty: "Cardiology",
      qualifications: "MD, FACC, Board Certified Cardiologist",
      experience: "15 years",
      rating: 4.8,
      reviewCount: 245,
      availableSlots: ["Today 2:00 PM", "Tomorrow 10:00 AM", "Thu 3:30 PM"],
      clinics: ["Main Clinic - Downtown", "North Branch"],
      languages: ["English", "Spanish", "French"],
    },
  },
}

export const Compact: Story = {
  args: {
    doctor: {
      id: "2",
      name: "John Doe",
      specialty: "Pediatrics",
      qualifications: "MD, FAAP",
      rating: 4.9,
    },
    compact: true,
  },
}

export const WithoutImage: Story = {
  args: {
    doctor: {
      id: "3",
      name: "Emily Johnson",
      specialty: "Dermatology",
      qualifications: "MD, Board Certified Dermatologist",
      experience: "10 years",
      rating: 4.7,
      reviewCount: 189,
      clinics: ["Skin Care Center"],
      languages: ["English"],
    },
  },
}
