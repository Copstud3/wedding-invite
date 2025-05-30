"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { strings } from "../utils/strings";
import { submitRSVP } from "../actions/submitRSVP";
import { toast } from "sonner";

export default function RsvpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accompany, setAccompany] = useState<string | null>(null);
  const [attendance, setAttendance] = useState("yes");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const openGoogleMaps = () => {
    const encodedLocation = encodeURIComponent(strings.eventLocation);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};

    if (!name) {
      newErrors.name = "Name is required";
    }
    if (!email) {
      newErrors.email = "Email is required";
    }

    // Check if user selected "No" but has accompany count > 0
    if (accompany && parseInt(accompany) > 0 && attendance.toLowerCase() === "no") {
      newErrors.accompany = "You can't have guests if you can't make it";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("accompany", accompany || "0");
    formData.append("attendance", attendance);

    console.log(formData, "formData");
    setIsLoading(true);
    const response = await submitRSVP(formData);

    if (response.success) {
      toast("Success", {
        description: strings.thankYouMessage,
      });
      //Reset form
      setName("");
      setEmail("");
      setAccompany(null);
      setAttendance("yes");
      setErrors({});
    } else {
      toast.error("Error", {
        description: response.message,
      });

      if (response.error) {
        if (response.error.code === "23505") {
          setErrors({email: "Email already exists (You responded already)"});
        }
      }
    }

    setIsLoading(false);
  };

  return (
    <div className=" my-10">
      <h1 className="text-[48px] md:text-[90px] font-bold mb-4 font-poppins text-center bg-gradient-to-r from-black to-gray-300 bg-clip-text text-transparent ">{strings.title}</h1>
      <h2 className="text-center mb-4 text-lg md:text-2xl font-poppins font-bold">{strings.topic}</h2>
      <div className="max-sm:px-10 md:max-w-md mx-auto">
      <p className="mb-6 font-inter text-center mx-auto md:w-[400px]">{strings.description}</p>
      <div className="mb-4">
        <label className="font-semibold">{strings.eventDateLabel}</label>
        {/* <p>{new Date(strings.eventDate).toLocaleDateString()}</p> */}
        <Calendar
          mode="single"
          selected={new Date(strings.eventDate)}
          className="rounded-md border flex flex-col items-center mt-3"
          fromDate={new Date(strings.eventDate)}
          toDate={new Date(strings.eventDate)}
          defaultMonth={new Date(strings.eventDate)}
          ISOWeek
        />
        <div className="mt-4">
          <Button
            type="button"
            variant={"outline"}
            onClick={openGoogleMaps}
            className="w-full"
          >
            <MapPin />
            {strings.viewOnMapButton}
          </Button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-1">
          <label htmlFor="name">{strings.nameLabel}</label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email">{strings.emailLabel}</label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="accompany">{strings.accompanyLabel}</label>
          <Input
            id="accompany"
            type="number"
            min="0"
            value={accompany || ""}
            placeholder="Number of people you accompany"
            onChange={(e) => setAccompany(e.target.value)}
          />
          {errors.accompany && (
            <p className="text-red-500 text-sm mt-1">{errors.accompany}</p>
          )}
        </div>

        <div>
          <label>{strings.rsvpLabel}</label>
          <RadioGroup value={attendance} onValueChange={setAttendance} className="mt-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="yes" />
              <label htmlFor="yes">{strings.yesOption}</label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="no" />
              <label htmlFor="no">{strings.noOption}</label>
            </div>
          </RadioGroup>
        </div>
        <Button disabled={isLoading} type="submit" className="w-full">
          {isLoading ? "Sending" : strings.submitButton}
        </Button>
      </form>
      </div>
    </div>
  );
}