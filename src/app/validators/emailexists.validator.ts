import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms"
import { UsersService } from "../services/users.service"
import { map, Observable } from "rxjs"

export class EmailExistsValidator {
    static validate(userService: UsersService): AsyncValidatorFn {
      return (control: AbstractControl): Observable<ValidationErrors | null> => {
        return userService.checkIfEmailExist(control.value).pipe(
          map((result: boolean) => result ? {emailAlreadyExists: true} : null)
        )
      }
    }
  }