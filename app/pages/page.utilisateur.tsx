"use client";

import React, { useState } from "react";
import { Check } from "@gravity-ui/icons";
import {
  Button,
  Card,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";

export default function UtilisateurForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    alert(`Form submitted with: ${JSON.stringify(data, null, 2)}`);
  };

  return (
    <Card className="flex items-center justify-center min-h-screen bg-transparent">
      <Form className="flex w-96 flex-col gap-4" onSubmit={onSubmit}>
        
        {/* NOM */}
        <TextField isRequired name="nom">
          <Label>Nom</Label>
          <Input placeholder="Entrer le nom" />
          <FieldError />
        </TextField>

        {/* PRENOMS */}
        <TextField isRequired name="prenoms">
          <Label>Prénoms</Label>
          <Input placeholder="Entrer les prénoms" />
          <FieldError />
        </TextField>

        {/* TELEPHONE */}
        <TextField isRequired name="telephone" type="tel">
          <Label>Téléphone</Label>
          <Input placeholder="Entrer le numéro" />
          <FieldError />
        </TextField>

        {/* ROLE */}
        <TextField isRequired name="role">
          <Label>Rôle</Label>
          <Input placeholder="Entrer le rôle" />
          <FieldError />
        </TextField>

        {/* EMAIL */}
        <TextField
          isRequired
          name="email"
          type="email"
          validate={(value) => {
            if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
              return "Email invalide";
            }
            return null;
          }}
        >
          <Label>Email</Label>
          <Input placeholder="exemple@gmail.com" />
          <FieldError />
        </TextField>

        {/* PASSWORD */}
        <TextField
          isRequired
          name="password"
          type="password"
          validate={(value) => {
            if (value.length < 8) {
              return "Minimum 8 caractères";
            }
            if (!/[A-Z]/.test(value)) {
              return "Au moins une majuscule";
            }
            if (!/[0-9]/.test(value)) {
              return "Au moins un chiffre";
            }
            return null;
          }}
        >
          <Label>Mot de passe</Label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrer le mot de passe"
          />
          <Description>
            8 caractères minimum, 1 majuscule, 1 chiffre
          </Description>
          <FieldError />
        </TextField>

        {/* CONFIRM PASSWORD */}
        <TextField
          isRequired
          name="confirmPassword"
          type="password"
          validate={(value) => {
            if (value !== password) {
              return "Les mots de passe ne correspondent pas";
            }
            return null;
          }}
        >
          <Label>Confirmer le mot de passe</Label>
          <Input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmer le mot de passe"
          />
          <FieldError />
        </TextField>

        {/* BUTTONS */}
        <div className="flex gap-2">
          <Button type="submit">
            <Check />
            Enregistrer
          </Button>

          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </div>
      </Form>
    </Card>
  );
}