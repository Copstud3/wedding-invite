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

    if (!name) {
      setErrors({ name: "Name is required" });
      return;
    }
    if (!email) {
      setErrors({ name: "Email is required" });
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
      setAttendance("yes")
      setErrors({})
    }else {
    toast.error("Error", {
        description: response.message,
    })

    if(response.error){
      if(response.error.code === "23505"){
          setErrors({email: "Email already exists (You responded already)"});
      }
    }
}

setIsLoading(false);

  };

  return (
    <div className="max-w-md mx-auto my-10">
      <h1 className="text-2xl font-bold mb-4">{strings.title}</h1>
      <p className="mb-6">{strings.description}</p>
      <div className="mb-4">
        <label>{strings.eventDateLabel}</label>
        {/* <p>{new Date(strings.eventDate).toLocaleDateString()}</p> */}
        <Calendar
          mode="single"
          selected={new Date(strings.eventDate)}
          className="rounded-md border flex flex-col items-center"
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
        <div>
          <label htmlFor="name">{strings.nameLabel}</label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email">{strings.emailLabel}</label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="accompany">{strings.accompanyLabel}</label>
          <Input
            id="accompany"
            type="number"
            min="0"
            value={accompany || ""}
            onChange={(e) => setAccompany(e.target.value)}
          />
        </div>

        <div>
          <label>{strings.rsvpLabel}</label>
          <RadioGroup value={attendance} onValueChange={setAttendance}>
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
        <Button disabled={isLoading} type="submit">
          {isLoading ? "Sending" : strings.submitButton}
        </Button>
      </form>
    </div>
  );
}
